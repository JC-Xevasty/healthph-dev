import { createAsyncThunk } from "@reduxjs/toolkit";
import { baseAPI } from "./_baseAPI";

export const activityLogApi = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation({
      query: (data) => ({
        url: "/upload",
        method: "POST",
        body: data,
      }),
    }),
    generateFrequentWords: builder.query({
      query: (filters) => {
        return {
          url: "/frequent-words",
          params: { filters: filters },
        };
      },
    }),
    generateWordCloud: builder.query({
      queryFn: async (filters) => {
        try {
          const response = await fetch(
            import.meta.env.VITE_API_URL + "/wordcloud?filters=" + filters
          );

          const blob = await response.blob();

          const objectURL = URL.createObjectURL(blob);

          return { data: objectURL };
        } catch (error) {
          return { error };
        }
      },
    }),
  }),
});

export const {
  useUploadFileMutation,
  useGenerateFrequentWordsQuery,
  useGenerateWordCloudQuery,
} = activityLogApi;