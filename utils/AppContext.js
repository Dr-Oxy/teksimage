/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useState } from 'react';
import { useRouter } from 'next/router';

import { openai } from './helpers';

import { useForm } from 'react-hook-form';

export const AppContext = createContext();

export const AppProvider = (props) => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [prompt, setPrompt] = useState('');

  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  function resetState() {
    setTimeout(() => {
      reset();
      setGenerated(false);
    }, 5000);
  }

  const generatePrompt = handleSubmit(async (data) => {
    setIsLoading(true);

    setPrompt(data.prompt);

    try {
      const response = await openai.createImage(
        {
          prompt: data.prompt,
          n: 6,
          size: '512x512',
          response_format: 'b64_json',
        },
        {
          onUploadProgress: ({ loaded, total }) => {
            let progress = ((loaded / total) * 100).toFixed(2);
            setProgress(progress);
          },
        },
      );

      if (response.status === 200) {
        setProgress(0);
        setResults(response.data.data);
        setIsLoading(false);

        setGenerated(true);

        resetState();
        router.push('/result');
      }
    } catch (error) {
      setIsLoading(false);
      setProgress(0);
      setGenerated(false);

      if (error.response) {
        console.log(error.response.status, error.response.data);
      } else {
        console.log(error.message);
      }
    }
  });

  return (
    <AppContext.Provider
      value={{
        results,
        isLoading,
        generatePrompt,
        generated,
        progress,
        register,
        errors,
        prompt,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};
