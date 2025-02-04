/*
 * Copyright 2021 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  FactRetriever,
  FactRetrieverRegistration,
  FactSchema,
} from '@backstage/plugin-tech-insights-node';
import { ConflictError, NotFoundError } from '@backstage/errors';

/**
 * @public
 *
 */
export interface FactRetrieverRegistry {
  readonly retrievers: Map<string, FactRetrieverRegistration>;
  register(registration: FactRetrieverRegistration): void;
  get(retrieverReference: string): FactRetrieverRegistration;
  listRetrievers(): FactRetriever[];
  listRegistrations(): FactRetrieverRegistration[];
  getSchemas(): FactSchema[];
}

export class DefaultFactRetrieverRegistry implements FactRetrieverRegistry {
  readonly retrievers = new Map<string, FactRetrieverRegistration>();

  constructor(retrievers: FactRetrieverRegistration[]) {
    retrievers.forEach(it => {
      this.register(it);
    });
  }

  register(registration: FactRetrieverRegistration) {
    if (this.retrievers.has(registration.factRetriever.id)) {
      throw new ConflictError(
        `Tech insight fact retriever with identifier '${registration.factRetriever.id}' has already been registered`,
      );
    }
    this.retrievers.set(registration.factRetriever.id, registration);
  }

  get(retrieverReference: string): FactRetrieverRegistration {
    const registration = this.retrievers.get(retrieverReference);
    if (!registration) {
      throw new NotFoundError(
        `Tech insight fact retriever with identifier '${retrieverReference}' is not registered.`,
      );
    }
    return registration;
  }

  listRetrievers(): FactRetriever[] {
    return [...this.retrievers.values()].map(it => it.factRetriever);
  }

  listRegistrations(): FactRetrieverRegistration[] {
    return [...this.retrievers.values()];
  }

  getSchemas(): FactSchema[] {
    return this.listRetrievers().map(it => it.schema);
  }
}
