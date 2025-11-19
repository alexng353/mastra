import { convertGenAISpanAttributesToOpenInferenceSpanAttributes } from '@arizeai/openinference-genai';
import type { Mutable } from '@arizeai/openinference-genai/types';
import {
  INPUT_MIME_TYPE,
  INPUT_VALUE,
  OUTPUT_MIME_TYPE,
  OUTPUT_VALUE,
} from '@arizeai/openinference-semantic-conventions';
import type { ExportResult } from '@opentelemetry/core';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import type { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import {
  ATTR_GEN_AI_INPUT_MESSAGES,
  ATTR_GEN_AI_OUTPUT_MESSAGES,
} from '@opentelemetry/semantic-conventions/incubating';

export class OpenInferenceOTLPTraceExporter extends OTLPTraceExporter {
  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void) {
    const processedSpans = spans.map(span => {
      const processedAttributes = convertGenAISpanAttributesToOpenInferenceSpanAttributes(span.attributes);
      // only add processed attributes if conversion was successful
      if (processedAttributes) {
        const inputMessages = span.attributes[ATTR_GEN_AI_INPUT_MESSAGES];
        if (inputMessages) {
          processedAttributes[INPUT_MIME_TYPE] = 'application/json';
          processedAttributes[INPUT_VALUE] = inputMessages;
        }
        const outputMessages = span.attributes[ATTR_GEN_AI_OUTPUT_MESSAGES];
        if (outputMessages) {
          processedAttributes[OUTPUT_MIME_TYPE] = 'application/json';
          processedAttributes[OUTPUT_VALUE] = outputMessages;
        }

        (span as Mutable<ReadableSpan>).attributes = processedAttributes;
      }
      return span;
    });

    super.export(processedSpans, resultCallback);
  }
}
