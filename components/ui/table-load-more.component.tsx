"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Loader } from "./loader";

interface Props {
  continuationToken?: number;
  fetchInProgress: boolean;
  onEnterView: () => void;
  isLoading: boolean;
}

export function TableLoadMore(props: Props) {
  const { ref, inView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (inView && !props.fetchInProgress && props.continuationToken) {
      props.onEnterView();
    }
  }, [inView, props.fetchInProgress, props.continuationToken]);

  return (
    <>
      <div ref={ref} className="w-full h-[1px]"></div>
      {props.fetchInProgress || props.isLoading && (
        <div className="relative w-full flex justify-center h-[100px] pt-[20px] scale-75">
          <Loader backdrop={false} />
        </div>
      )}
    </>
  );
}
