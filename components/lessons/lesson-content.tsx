import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, StyleSheet, useColorScheme, View } from "react-native";

import { Colors } from "@/constants/theme";
import { incrementLessonCompleted } from "@/lib/lesson-progress";
import {
  recordQuestionAnswered,
  recordQuestionListened,
} from "@/lib/speaking-listening-stats";
import { supabase } from "@/lib/utils/supabase";
import { Question, SpeakingOption } from "@/types/course-data";
import { useAudioRecorder, RecordingPresets, AudioModule } from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import { toast } from "sonner-native";
import levenshtein from "string-comparison";
import { ThemedText } from "../themed-text";
import ConfirmDialog from "../ui/confirm-dialog";
import AudioPrompt from "./audio-prompt";
import FeedbackView from "./feedback-view";
import LessonCompleted from "./lesson-completed";
import ListeningMultipleChoiceMode from "./listening-multiple-choice-mode";
import MultipleChoiceMode from "./multiple-choice-mode";
import ProgressHeader from "./progress-header";
import SentenceBreakdownCard from "./sentence-breakdown-card";
import SingleResponseMode from "./single-response-mode";

interface WrongQuestion {
  english: string;
  mandarin: {
    hanzi: string;
    pinyin: string;
  };
  attempts: number;
}

export interface LessonStats {
  correctAnswer: number;
  totalQuestions: number;
  accuracy: number;
  wrongQuestions?: WrongQuestion[];
}

const MAX_ATTEMPT = 3;

export default function LessonContent({
  questions,
  lessonId,
}: {
  questions: Question[];
  lessonId: string;
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const [transcription, setTranscription] = useState<{
    expected: string;
    said: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(false);
  const [showResult, setShowResult] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [showMandarin, setShowMandarin] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isSpeechPlaying, setIsSpeechPlaying] = useState(false);
  const [hasListenedToAudio, setHasListenedToAudio] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [exitConfirmVisible, setExitConfirmVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  //Lesson completion
  const [showCompleteScreen, setShowCompleteScreen] = useState(false);
  const [lessonStats, setLessonStats] = useState<LessonStats | null>(null);
  const [questionAttempts, setQuestionAttempts] = useState<
    Record<number, number>
  >({});
  const [correctAnswerCount, setCorrectAnswerCount] = useState(0);
  const [wrongQuestions, setWrongQuestions] = useState<Set<number>>(new Set());
  const [hasStartedFirstPlay, setHasStartedFirstPlay] = useState(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const currentQuestion = useMemo(
    () => questions[currentQuestionIndex],
    [questions, currentQuestionIndex],
  );

  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const optionsAnimationValue = useRef(new Animated.Value(0)).current;
  const audioSectionAnimationHeight = useRef(new Animated.Value(400)).current;
  const optionSelectAnimation = useRef(new Animated.Value(0)).current;
  const instructionOpacityAnimation = useRef(new Animated.Value(1)).current;
  const listeningOpacityAnimation = useRef(new Animated.Value(0)).current;
  const listeningScaleAnimation = useRef(new Animated.Value(0.95)).current;

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const selectedSentence = useMemo((): SpeakingOption | null => {
    if (!currentQuestion) return null;

    if (currentQuestion.type === "listening_mc") {
      if (showResult) {
        const correctEnglish =
          currentQuestion.options.find(
            (option) => option.id === currentQuestion.correctOptionId,
          )?.english || "";

        return {
          id: currentQuestion.id,
          english: correctEnglish,
          mandarin: {
            ...currentQuestion.mandarin,
          },
        };
      }

      return null;
    }

    if (!selectedOption) return null;

    return currentQuestion.options.find((opt) => opt.id === selectedOption)!;
  }, [selectedOption, currentQuestion, showResult]);

  useEffect(() => {
    return () => {
      try {
        Speech.stop();
        if (audioRecorder.isRecording) {
          audioRecorder.stop();
        }
      } catch (e) {
        // Native shared object may already be destroyed on unmount
      }
    };
  }, []);

  useEffect(() => {
    Speech.stop();
    setIsSpeechPlaying(false);
  }, [currentQuestion]);

  useEffect(() => {
    if (showResult) {
      if (isCorrect) {
        if (
          attemptCount === 0 ||
          (attemptCount > 0 && wrongQuestions.has(currentQuestion.id))
        ) {
          setCorrectAnswerCount((prev) => prev + 1);
        }
      } else {
        setQuestionAttempts((prev) => ({
          ...prev,
          [currentQuestion.id]: (prev[currentQuestion.id] || 0) + 1,
        }));

        if (attemptCount === 0) {
          setWrongQuestions((prev) => new Set(prev).add(currentQuestion.id));
        }
      }
    }
  }, [currentQuestion.id, isCorrect, showResult, attemptCount]);

  useEffect(() => {
    if (isSpeechPlaying && !hasStartedFirstPlay && !hasListenedToAudio) {
      setHasStartedFirstPlay(true);
      Animated.parallel([
        Animated.timing(instructionOpacityAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(listeningOpacityAnimation, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(listeningScaleAnimation, {
            toValue: 1.05,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(listeningScaleAnimation, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [isSpeechPlaying, hasStartedFirstPlay, hasListenedToAudio]);

  useEffect(() => {
    if (
      currentQuestion.type === "single_response" &&
      currentQuestion.options.length > 0 &&
      hasListenedToAudio
    ) {
      setSelectedOption(currentQuestion.options[0].id);
      Animated.timing(optionSelectAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [currentQuestion, hasListenedToAudio]);

  const finishListening = () => {
    if (hasListenedToAudio) return;
    setHasListenedToAudio(true);
    setIsSpeechPlaying(false);

    void recordQuestionListened();

    Animated.parallel([
      Animated.timing(audioSectionAnimationHeight, {
        toValue: 200,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(optionsAnimationValue, {
        toValue: 1,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const playAudio = () => {
    const textToSpeak =
      currentQuestion.mandarin.hanzi || currentQuestion.mandarin.pinyin;

    if (isSpeechPlaying) {
      Speech.stop();
      setIsSpeechPlaying(false);
      return;
    }

    setIsSpeechPlaying(true);
    Speech.speak(textToSpeak, {
      language: "zh-CN",
      onDone: () => {
        setIsSpeechPlaying(false);
        finishListening();
      },
      onStopped: () => {
        setIsSpeechPlaying(false);
      },
      onError: () => {
        setIsSpeechPlaying(false);
      },
    });
  };

  const startRecording = async () => {
    if (isSpeechPlaying) {
      Speech.stop();
      setIsSpeechPlaying(false);
    }

    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        toast.error("Microphone Permission", {
          description: "Microphone access is required to practice speaking.",
        });
        return;
      }

      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        interruptionMode: 'doNotMix',
        shouldPlayInBackground: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecognizing(true);
    } catch (error) {
      console.error("Error starting recording:", error);

      setIsRecognizing(false);
      toast.error("Recording Error", {
        description: "Unable to start recording.",
      });
    }
  };

  const processSpeechResult = (transcript: string) => {
    setIsLoading(false);
    setShowResult(true);

    const punctuationRegex = /[.,\/#!$%\^&\*;:{}=\-_`~()?]/g;

    const rawExpected = selectedSentence?.mandarin.pinyin || "";
    const expected = rawExpected
      .toLowerCase()
      .replace(punctuationRegex, "")
      .replace(/\s+/g, "")
      .trim();

    const said = transcript
      .toLowerCase()
      .replace(punctuationRegex, "")
      .replace(/\s+/g, "")
      .trim();

    setTranscription({ expected: rawExpected, said: transcript });

    if (!said || !expected) {
      setIsCorrect(false);
    } else {
      const similarity = levenshtein.levenshtein.similarity(expected, said);
      const isSimilarEnough = similarity > 0.8;
      setIsCorrect(isSimilarEnough);
      if (isSimilarEnough) {
        void recordQuestionAnswered();
      }
    }

    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }),

      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const stopRecording = async () => {
    setIsLoading(true);
    setIsRecognizing(false);

    try {
      if (!audioRecorder.isRecording) {
        setIsLoading(false);
        return;
      }

      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      if (!uri) {
        setIsLoading(false);
        toast.error("Recording Error", {
          description: "No audio was recorded.",
        });
        return;
      }

      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { data, error } = await supabase.functions.invoke(
        "transcribe-audio",
        {
          body: {
            inputAudio: {
              data: base64Audio,
              format: "wav",
            },
          },
        },
      );

      if (error) {
        throw error;
      }

      if (data?.transcript) {
        processSpeechResult(data?.transcript);
      } else {
        throw new Error("No transcript returned");
      }
    } catch (error) {
      console.error("Error starting/stopping recording:", error);
      setIsLoading(false);
      toast.error("Transcription Error", {
        description: "Unable to transcribe audio.",
      });
    }
  };

  const handleRevealMandarin = () => {
    if (showMandarin) {
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setShowMandarin(false));
    } else {
      setShowMandarin(true);
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleOptionPress = (id: number) => {
    if (currentQuestion.type === "listening_mc") {
      setSelectedOption(id);
      setIsCorrect(id === currentQuestion.correctOptionId);
      setShowResult(true);

      Animated.sequence([
        Animated.timing(optionSelectAnimation, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),

        Animated.timing(optionSelectAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      return;
    }
    const isDeselecting = selectedOption === id;
    const newSelectedOption = isDeselecting ? null : id;
    setSelectedOption(newSelectedOption);

    Animated.timing(optionSelectAnimation, {
      toValue: isDeselecting ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const nextQuestion = () => {
    Animated.timing(audioSectionAnimationHeight, {
      toValue: 400,
      duration: 500,
      useNativeDriver: false,
    }).start(() => {
      if (currentQuestionIndex < questions.length - 1) {
        resetState();
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        const accuracy = Math.round(
          (correctAnswerCount / questions.length) * 100,
        );

        const wrongQuestionsList = questions
          .filter((q) => wrongQuestions.has(q.id))
          .map((q) => {
            let english = "";
            let hanzi = "";
            let pinyin = "";

            if (q.type === "listening_mc") {
              english =
                q.options.find((opt) => opt.id === q.correctOptionId)
                  ?.english || "";
              hanzi = q.mandarin.hanzi;
              pinyin = q.mandarin.pinyin;
            } else {
              const option = q.options?.[0];
              english = option?.english || "";
              hanzi = option?.mandarin.hanzi || "";
              pinyin = option?.mandarin.pinyin || "";
            }

            return {
              english,
              mandarin: {
                hanzi,
                pinyin,
              },
              attempts: questionAttempts[q.id] || 1,
            };
          });

        const finalStats: LessonStats = {
          correctAnswer: correctAnswerCount,
          totalQuestions: questions.length,
          accuracy,
          wrongQuestions: wrongQuestionsList,
          // wrongQuestionsList.length > 0 ? wrongQuestionsList : undefined,
        };

        setLessonStats(finalStats);
        setShowCompleteScreen(true);
      }
    });
  };

  const handleRetry = () => {
    Animated.timing(scaleAnimation, {
      toValue: 0.9,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowResult(false);
      setIsCorrect(null);
      setAttemptCount((prev) => prev + 1);

      if (currentQuestion.type === "listening_mc") {
        setSelectedOption(null);
      } else {
        setIsLoading(false);
        setHasListenedToAudio(true);

        if (currentQuestion.type === "multiple_choice") {
          optionSelectAnimation.setValue(0);
          setSelectedOption(null);
        } else {
          optionSelectAnimation.setValue(1);
        }

        audioSectionAnimationHeight.setValue(200);
        optionsAnimationValue.setValue(1);
        instructionOpacityAnimation.setValue(0);
        listeningOpacityAnimation.setValue(0);
      }

      scaleAnimation.setValue(1);
    });
  };

  const resetState = () => {
    setShowMandarin(false);
    setSelectedOption(null);
    setShowResult(false);
    setHasListenedToAudio(false);
    setAttemptCount(0);
    setIsLoading(false);
    setTranscription(null);
    Speech.stop();
    setIsSpeechPlaying(false);
    fadeAnimation.setValue(0);
    scaleAnimation.setValue(1);
    optionsAnimationValue.setValue(0);
    optionSelectAnimation.setValue(0);
    instructionOpacityAnimation.setValue(1);
    listeningOpacityAnimation.setValue(0);
    listeningScaleAnimation.setValue(0.95);
    setHasStartedFirstPlay(false);
  };

  if (showCompleteScreen && lessonStats) {
    return (
      <LessonCompleted
        lessonStats={lessonStats}
        onContinue={async () => {
          await incrementLessonCompleted(lessonId);
          router.push("/lessons");
        }}
        onReview={() => {
          setShowCompleteScreen(false);
          setLessonStats(null);
          setCurrentQuestionIndex(0);
          setQuestionAttempts({});
          setCorrectAnswerCount(0);
          setWrongQuestions(new Set());
          resetState();
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ConfirmDialog
        visible={exitConfirmVisible}
        title="Exit Practice?"
        description="Are you sure you want to quit? Your progress will be lost."
        onCancel={() => setExitConfirmVisible(false)}
        onConfirm={async () => {
          setExitConfirmVisible(false);
          try {
            Speech.stop();
            if (audioRecorder.isRecording) {
              await audioRecorder.stop();
            }
          } catch (e) {
            // Ignore native object lookup error if already released
          }

          router.push("/lessons");
        }}
      />
      <ProgressHeader
        progress={progress}
        currentCount={currentQuestionIndex + 1}
        totalCount={questions.length}
        onClose={() => setExitConfirmVisible(true)}
      />

      {/* Main content */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.audioSection,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.borderColor,
              borderWidth: 1,
              minHeight: audioSectionAnimationHeight,
              flex: hasListenedToAudio ? 0 : 1,
              justifyContent: "center",
              opacity: isLoading || showResult ? 0.6 : 1,
            },
          ]}
          pointerEvents={isLoading || showResult ? "none" : "auto"}
        >
          <AudioPrompt
            currentQuestion={currentQuestion}
            showMandarin={showMandarin}
            scaleAnimation={scaleAnimation}
            selectedOption={selectedOption}
            instructionOpacity={instructionOpacityAnimation}
            listeningOpacity={listeningOpacityAnimation}
            listeningScale={listeningScaleAnimation}
            fadeAnimation={fadeAnimation}
            hasListenedToAudio={hasListenedToAudio}
            isRecognizing={isRecognizing}
            isPlaying={isSpeechPlaying}
            onRevealMandarin={handleRevealMandarin}
            onPlay={playAudio}
            onStartRecord={startRecording}
            onStopRecord={stopRecording}
          />
        </Animated.View>

        {hasListenedToAudio && (
          <Animated.View
            style={[
              styles.optionsSection,
              {
                opacity: Animated.multiply(
                  optionsAnimationValue,
                  isLoading || showResult ? 0.5 : 1,
                ),
                transform: [
                  {
                    translateY: optionsAnimationValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  },
                ],
              },
            ]}
            pointerEvents={isLoading || showResult ? "none" : "auto"}
          >
            {currentQuestion.type === "multiple_choice" && (
              <MultipleChoiceMode
                options={currentQuestion.options}
                selectedOption={selectedOption}
                handleOptionPress={handleOptionPress}
                optionSelectAnimation={optionSelectAnimation}
                isLoading={isLoading}
                showResult={showResult}
              />
            )}
            {currentQuestion.type === "listening_mc" && (
              <ListeningMultipleChoiceMode
                options={currentQuestion.options}
                selectedOption={selectedOption}
                handleOptionPress={handleOptionPress}
                isLoading={isLoading}
                showResult={showResult}
              />
            )}
            {currentQuestion.type === "single_response" && (
              <SingleResponseMode
                option={currentQuestion.options[0]}
                // selectedOption={selectedOption}
                optionSelectAnimation={optionSelectAnimation}
                // handleOptionPress={handleOptionPress}
                // isLoading={isLoading}
                // showResult={showResult}
              />
            )}
          </Animated.View>
        )}

        {/* //Loading indicator */}
        {isLoading && (
          <View style={styles.bottomSection}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                color={Colors.primaryAccentColor}
                size="large"
              />
              <ThemedText
                style={[styles.loadingText, { color: colors.subduedText }]}
              >
                Analyzing your pronounciation...
              </ThemedText>
            </View>
          </View>
        )}

        {/* Feedback view */}
        {showResult && selectedSentence && (
          <Animated.View
            style={[
              styles.feedbackWrapper,
              {
                transform: [{ scale: scaleAnimation }],
              },
            ]}
          >
            <FeedbackView
              isCorrect={isCorrect}
              transcription={
                transcription
                  ? {
                      expected: transcription.expected,
                      said: transcription.said,
                    }
                  : undefined
              }
              onContinue={nextQuestion}
              onRetry={
                attemptCount < MAX_ATTEMPT && !isCorrect
                  ? handleRetry
                  : undefined
              }
              maxAttempts={MAX_ATTEMPT}
              correctOption={selectedSentence}
              attemptCount={isCorrect ? attemptCount : attemptCount + 1}
            />
          </Animated.View>
        )}
      </View>

      {/* Sentence Breakdown Card */}
      {currentQuestion.type === "listening_mc" &&
        !isLoading &&
        hasListenedToAudio && (
          <SentenceBreakdownCard
            sentence={{
              english:
                currentQuestion.options.find(
                  (opt) => opt.id === currentQuestion.correctOptionId,
                )?.english || "",
              pinyin: currentQuestion.mandarin.pinyin,
              hanzi: currentQuestion.mandarin.hanzi,
              words: currentQuestion.mandarin.words,
              breakdown: currentQuestion.mandarin.breakdown,
            }}
            disabled={showResult}
          />
        )}
      {currentQuestion.type !== "listening_mc" &&
        !isLoading &&
        selectedSentence && (
          <SentenceBreakdownCard
            sentence={{
              english: selectedSentence.english,
              pinyin: selectedSentence.mandarin.pinyin,
              hanzi: selectedSentence.mandarin.hanzi,
              words: selectedSentence.mandarin.words,
              breakdown: selectedSentence.mandarin.breakdown,
            }}
            disabled={showResult}
          />
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  audioSection: {
    alignItems: "center",
    marginBottom: 40,
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
  },
  optionsSection: {
    flex: 1,
    marginBottom: 30,
  },
  bottomSection: {
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  feedbackWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 1000,
  },
});
