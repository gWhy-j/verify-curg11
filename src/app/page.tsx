"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { ReclaimProofRequest, verifyProof, Proof } from "@reclaimprotocol/js-sdk";
import { NextUIProvider } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import Image from "next/image";
function ReclaimDemo() {
  // State to store the verification request URL
  const [requestUrl, setRequestUrl] = useState("");
  /* eslint-disable */
  const [proofs, setProofs] = useState<any>(null);

  const getVerificationReq = async () => {
    // Your credentials from the Reclaim Developer Portal
    // Replace these with your actual credentials

    const APP_ID = process.env.NEXT_PUBLIC_RECLAIM_APPLICATION_ID!;
    const APP_SECRET = process.env.NEXT_PUBLIC_RECLAIM_APPLICATION_SECRET!;
    const PROVIDER_ID = "21d0e197-99fc-4014-b72c-b4a02d5f3723";

    // Initialize the Reclaim SDK with your credentials
    const reclaimProofRequest = await ReclaimProofRequest.init(APP_ID, APP_SECRET, PROVIDER_ID);

    // Generate the verification request URL
    const requestUrl = await reclaimProofRequest.getRequestUrl();

    setRequestUrl(requestUrl);

    // Start listening for proof submissions
    await reclaimProofRequest.startSession({
      // Called when the user successfully completes the verification
      onSuccess: async (proofs) => {
        setProofs(proofs);

        if (typeof proofs !== "string") {
          const isVerified = await verifyProof(proofs as Proof);
          console.log({ isVerified });
        }

        // Add your success logic here, such as:
        // - Updating UI to show verification success
        // - Storing verification status
        // - Redirecting to another page
      },
      // Called if there's an error during verification
      onError: (error) => {
        console.error("Verification failed", error);
        // Add your error handling logic here, such as:
        // - Showing error message to user
        // - Resetting verification state
        // - Offering retry options
      },
    });
  };

  return (
    <NextUIProvider>
      <div className="flex flex-col items-center justify-center h-screen w-screen overflow-hidden gap-4 p-8">
        <div className={`w-[300px] h-[300px] flex justify-center items-center ${requestUrl ? "bg-white" : ""}`}>{requestUrl ? <QRCode value={requestUrl} /> : <Image src="/curg.png" alt="CURG" width={1008} height={1008} />}</div>

        <Button color="primary" onClick={getVerificationReq}>
          당신은 CURG 11기가 맞습니까?
        </Button>

        {proofs && (
          <div className=" bg-white h-full w-[500px] absolute right-0 p-8 z-50">
            <h2 className="mb-4 text-bold text-2xl">Verification Successful!</h2>
            <pre>{JSON.stringify(proofs, null, 2)}</pre>
          </div>
        )}
      </div>
    </NextUIProvider>
  );
}

export default ReclaimDemo;
