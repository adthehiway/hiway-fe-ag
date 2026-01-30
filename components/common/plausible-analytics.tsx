"use client";

import Script from "next/script";

export default function PlausibleAnalytics() {
  return (
    <>
      <Script
        async
        src="https://plausible.io/js/pa-RSbFP7GZe9npDppk5_yEW.js"
        strategy="afterInteractive"
      />
      <Script id="plausible-init" strategy="afterInteractive">
        {`
         window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}}; plausible.init();
        `}
      </Script>
    </>
  );
}
