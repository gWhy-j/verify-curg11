"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { ReclaimProofRequest, verifyProof, Proof } from "@reclaimprotocol/js-sdk";
import { Button } from "@nextui-org/react";
import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";
import { DYLAN_ABI } from "./abi/DYLAN";
import { useWriteContract, useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import "@rainbow-me/rainbowkit/styles.css";

const MINT_CONTRACT_ADDRESS = "0xa459CEc2C5EeA8d17C8b0724E5Bbd5dfA9Dba38E";

// interface ProofType {
//   identifier: string; // unique identifier for proof
//   claimData: {
//     provider: string; // provider type (e.g. "http")
//     parameters: string; // stringified JSON containing request details like body, headers, url etc
//     owner: string; // owner's ethereum address
//     timestampS: number; // unix timestamp in seconds
//     context: string; // stringified JSON with context info and extracted parameters
//     identifier: string; // same as parent identifier
//     epoch: number; // epoch number of the proof
//   };
//   signatures: string[]; // array of ethereum signatures
//   witnesses: {
//     id: string; // witness ethereum address
//     url: string; // witness websocket URL
//   }[];
//   publicData?: { [key: string]: string } | undefined; // public data if any, null if none
// }

function ReclaimDemo() {
  // State to store the verification request URL
  const [requestUrl, setRequestUrl] = useState("");
  /* eslint-disable */
  const [proofs, setProofs] = useState<Proof | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();

  const getVerificationReq = async () => {
    setIsLoading(true);
    // Your credentials from the Reclaim Developer Portal
    // Replace these with your actual credentials
    const APP_ID = process.env.NEXT_PUBLIC_RECLAIM_APPLICATION_ID!;
    const APP_SECRET = process.env.NEXT_PUBLIC_RECLAIM_APPLICATION_SECRET!;
    const PROVIDER_ID = "f6499cae-9308-4ee5-af96-bc6736bbe286";

    // Initialize the Reclaim SDK with your credentials
    const reclaimProofRequest = await ReclaimProofRequest.init(APP_ID, APP_SECRET, PROVIDER_ID);

    // Generate the verification request URL
    const requestUrl = await reclaimProofRequest.getRequestUrl();

    setRequestUrl(requestUrl);

    // Start listening for proof submissions
    await reclaimProofRequest.startSession({
      // Called when the user successfully completes the verification
      onSuccess: async (proofs) => {
        if (proofs && typeof proofs !== "string") {
          setProofs(proofs);
          const isVerified = await verifyProof(proofs);
          console.log({ isVerified });
        }

        toast.success("Verification successful");

        if (proofs && typeof proofs !== "string") {
          // Transform proofs to the expected format
          const formattedProof = {
            claimInfo: {
              provider: proofs.claimData.provider,
              parameters: proofs.claimData.parameters,
              context: proofs.claimData.context,
            },
            signedClaim: {
              claim: {
                identifier: proofs.identifier as `0x${string}`,
                owner: proofs.claimData.owner as `0x${string}`,
                timestampS: proofs.claimData.timestampS,
                epoch: proofs.claimData.epoch,
              },
              signatures: proofs.signatures as readonly `0x${string}`[],
            },
          };

          await writeContractAsync({
            address: MINT_CONTRACT_ADDRESS,
            abi: DYLAN_ABI,
            functionName: "mint",
            args: [formattedProof],
          });
        }

        setIsLoading(false);
      },
      // Called if there's an error during verification
      onError: (error) => {
        toast.error("Verification failed");
        // Add your error handling logic here, such as:
        // - Showing error message to user
        // - Resetting verification state
        // - Offering retry options
        setIsLoading(false);
      },
    });
  };
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen w-screen overflow-hidden gap-16 p-8">
        <div className="text-3xl font-bold text-white">Claim Your $DYLAN</div>
        <div className={`w-32 h-32 flex justify-center items-center ${requestUrl ? "bg-white" : ""}`}>{requestUrl ? <QRCode value={requestUrl} /> : <Image className="rounded-full" src="/a41-512.png" alt="a41" width={512} height={512} />}</div>
        {address && (
          <Button size="md" isLoading={isLoading} onClick={getVerificationReq} className="bg-white text-black font-semibold text-lg py-6 px-8">
            Check Eligibility
          </Button>
        )}
        {!address && <ConnectButton />}
      </div>
      <Toaster />
    </>
  );
}

export default ReclaimDemo;
