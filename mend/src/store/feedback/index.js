import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '../../api';

export const feedbackSlice = createApi({
  reducerPath: 'feedbackSlice',
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    setNewQuestion: builder.mutation({
      query: (question) => ({
        url: '/api/support',
        method: 'POST',
        data: question,
      }),
    }),
  }),
});

export const { useSetNewQuestionMutation } = feedbackSlice;
