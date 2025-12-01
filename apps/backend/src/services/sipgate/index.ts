// SPDX-License-Identifier: MIT
// apps/backend/src/services/sipgate/index.ts

export { default as sipgateClient, SipgateClient } from "./SipgateClient.js";
export type { 
  SipgateConfig, 
  SipgateUser, 
  SipgateDevice, 
  SipgateCall, 
  SipgateSMS, 
  SipgateFax 
} from "./SipgateClient.js";

export { default as callHandler, CallHandler } from "./CallHandler.js";
export type { IncomingCall, CallLog } from "./CallHandler.js";

export { default as faxProcessor, FaxProcessor } from "./FaxProcessor.js";
export type { FaxDocument, FaxClassification } from "./FaxProcessor.js";

export { default as voiceAI, VoiceAI } from "./VoiceAI.js";
export type { 
  TTSOptions, 
  STTOptions, 
  TranscriptionResult, 
  VoiceResponse 
} from "./VoiceAI.js";
