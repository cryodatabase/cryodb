"use client"

import React, { useState } from "react";
import Turnstile, { useTurnstile } from "react-turnstile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, X } from "lucide-react";
import Image from "next/image";

// Define TypeScript interfaces
interface ReportErrorProps {
  hash: string;
  name: string;
}

const ReportError: React.FC<ReportErrorProps> = ({ hash, name }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [formError, setFormError] = useState("");
  const turnstile = useTurnstile();
  const siteKey = process.env.NEXT_PUBLIC_SITEKEY as string;
  
  if (!siteKey) {
    throw new Error('Missing NEXT_PUBLIC_SITEKEY environment variable');
  }

  // Construct page URL using hash
  const pageUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}/database/${hash}`
      : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setErrorMessage("");

    // Basic validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("A valid email is required");
      return;
    }
    if (!userMessage) {
      setFormError("Error details are required");
      return;
    }

    setButtonDisabled(true);

    fetch(`/api/report`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cloudflare_turnstile: turnstileToken,
        page_name: name,
        page_url: pageUrl,
        email,
        user_message: userMessage,
      }),
    })
      .then((response) => {
        setButtonDisabled(false);
        if (response.ok) {
          setSuccess(true);
        } else {
          turnstile.reset();
          response
            .json()
            .then((data) => {
              setErrorMessage(data.error || "Failed to report error");
            })
            .catch((jsonError) => {
              console.error("Error parsing JSON:", jsonError);
              setErrorMessage("An error occurred");
            });
        }
      })
      .catch((error) => {
        console.error("Error reporting:", error);
        setErrorMessage("An error occurred");
        setButtonDisabled(false);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Trigger Button */}
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 h-8 w-8 sm:h-8 sm:w-auto" title="Report an Error">
          <AlertTriangle className="h-4 w-4" />
          <span className="hidden sm:block">
            Report Error
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-6">
        <div>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Image
                  src="/assets/logo.png"
                  className="[html.light_&]:brightness-0"
                  alt="CryoRepository Logo"
                  width={24}
                  height={24}
                />
                Report an Error
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>
          {success ? (
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold">Success</h3>
              <p className="text-sm text-gray-600">
                Reported error to our admins. We will be in touch shortly.
              </p>
            </div>
          ) : (
            <div className="mt-4">
              {errorMessage && (
                <p className="text-sm text-red-600 mb-4">{errorMessage}</p>
              )}
              {formError && (
                <p className="text-sm text-red-600 mb-4">{formError}</p>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Article</label>
                  <Input
                    value={name}
                    disabled
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    maxLength={100}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Error Details</label>
                  <Textarea
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="Error Details"
                    maxLength={1000}
                    className="mt-1 min-h-[100px] resize-none"
                  />
                  <div className="text-sm text-gray-500 text-right mt-1">
                    {userMessage.length}/1000
                  </div>
                </div>
                <div className="flex justify-center">
                  <Turnstile
                    sitekey={siteKey}
                    theme="light"
                    onVerify={(token) => {
                      setTurnstileToken(token);
                      setButtonDisabled(false);
                    }}
                  />
                </div>
                <Button type="submit" disabled={buttonDisabled} className="w-full">
                  Report Error
                </Button>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportError;