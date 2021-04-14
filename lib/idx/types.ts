import { AuthTransaction } from '../tx';
import { IdxTransactionMeta } from '../types/Transaction';

export interface IdxApi {
  authenticate: (options: AuthenticationOptions) => Promise<AuthTransaction>;
  register: (options: RegistrationOptions) => Promise<AuthTransaction>;
  cancel: (options?: CancelOptions) => Promise<IdxResponse>;
  interact: (options?: InteractOptions) => Promise<InteractResponse>;
  recoverPassword: (options: PasswordRecoveryOptions) => Promise<AuthTransaction>;
}

// Values used to resolve remediations
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RemediationValues {}

export interface AuthenticationRemediationValues extends RemediationValues {
  credentials?: {
    passcode?: string;
  };

  username?: string;
  password?: string;
}

export interface RegistrationRemediationValues extends RemediationValues {
  authenticators: string[];
  firstName?: string;
  lastName?: string;
  email?: string;
  emailVerificationCode?: string;
  password?: string;
}

export interface PasswordRecoveryRemediationValues extends RemediationValues {
  authenticators: string[];
  identifier?: string;
  emailVerificationCode?: string;
  password?: string;
}

// A map from IDX data values (server spec) to RemediationValues (client spec)
export type IdxToRemediationValueMap = Record<string, string[] | string | boolean>;

export interface Remediator {
  canRemediate: () => boolean;
  getData: () => unknown;
}

export enum RemediatorFlow {
  Authentication,
  Registration,
  PasswordRecovery
}


export interface AcceptsInteractionHandle {
  interactionHandle?: string;
}

export interface IntrospectOptions extends AcceptsInteractionHandle {
  stateHandle?: string;
}

export type CancelOptions = IntrospectOptions;

export interface InteractOptions extends AcceptsInteractionHandle {
  state?: string;
  scopes?: string[];
}

export interface InteractResponse {
  state?: string;
  stateHandle?: string;
  interactionHandle?: string;
  idxResponse?: IdxResponse;
  meta?: IdxTransactionMeta;
}

export interface IdxOptions extends
  RemediationValues,
  InteractOptions,
  AcceptsInteractionHandle {
}

export interface RunOptions {
  flow: RemediatorFlow;
  needInteraction: boolean;
  actionPath?: string;
}

export interface AuthenticationOptions extends 
  IdxOptions,
  AuthenticationRemediationValues {
}

export interface RegistrationOptions extends 
  IdxOptions, 
  RegistrationRemediationValues {
}

export interface PasswordRecoveryOptions extends
  IdxOptions, 
  PasswordRecoveryRemediationValues {
}

// TODO: remove when idx-js provides type information
export interface IdxRemeditionValue {
  name: string;
  type?: string;
  required?: boolean;
}
export interface IdxRemediation {
  name: string;
  value: IdxRemeditionValue[];
  relatesTo: {
    type: string;
    value: {
      type: string;
    };
  };
}

export interface IdxMessage {
  message: string;
  class: string;
}

export interface IdxMessages {
  type: string; // "array"
  value: IdxMessage[];
}

// JSON response from the server
export interface RawIdxResponse {
  version: string;
  stateHandle: string;
  remediation?: IdxRemediation[];
  messages?: IdxMessages;
}

export function isRawIdxResponse(obj: any): obj is RawIdxResponse {
  return obj && obj.version;
}

// Object returned from idx-js
export interface IdxResponse {
  proceed: (remediationName: string, params: unknown) => Promise<IdxResponse>;
  neededToProceed: IdxRemediation[];
  rawIdxState: RawIdxResponse;
  interactionCode?: string;
  actions: Function[];
}
