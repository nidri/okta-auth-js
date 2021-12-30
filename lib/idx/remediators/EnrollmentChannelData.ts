import { IdxResponse } from '../types/idx-js';
/*!
 * Copyright (c) 2021-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


import { Remediator, RemediationValues } from './Base/Remediator';



export type EnrollmentChannelDataValues = RemediationValues & {
  email?: string;
  phoneNumber?: string;
};

export class EnrollmentChannelData extends Remediator {
  static remediationName = 'enrollment-channel-data';

  values: EnrollmentChannelDataValues;

  canRemediate() {
    return Boolean(this.values.email || this.values.phoneNumber);
  }

  getNextStep(idxResponse: IdxResponse) {
    const common = super.getNextStep();
    const authenticator = idxResponse.context.currentAuthenticator.value;
    return {
      ...common,
      authenticator,
    };
  }

  getData() {
    return {
      stateHandle: this.values.stateHandle,
      ...this.values
    };
  }

}