import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace telemetry. */
export namespace telemetry {

    /** Represents a TelemetryService */
    class TelemetryService extends $protobuf.rpc.Service {

        /**
         * Constructs a new TelemetryService service.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         */
        constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

        /**
         * Creates new TelemetryService service using the specified rpc implementation.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         * @returns RPC service. Useful where requests and/or responses are streamed.
         */
        public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): TelemetryService;

        /**
         * Calls StreamTelemetry.
         * @param request TelemetryBatch message or plain object
         * @param callback Node-style callback called with the error, if any, and ServerAck
         */
        public streamTelemetry(request: telemetry.ITelemetryBatch, callback: telemetry.TelemetryService.StreamTelemetryCallback): void;

        /**
         * Calls StreamTelemetry.
         * @param request TelemetryBatch message or plain object
         * @returns Promise
         */
        public streamTelemetry(request: telemetry.ITelemetryBatch): Promise<telemetry.ServerAck>;
    }

    namespace TelemetryService {

        /**
         * Callback as used by {@link telemetry.TelemetryService#streamTelemetry}.
         * @param error Error, if any
         * @param [response] ServerAck
         */
        type StreamTelemetryCallback = (error: (Error|null), response?: telemetry.ServerAck) => void;
    }

    /** Properties of a TelemetryBatch. */
    interface ITelemetryBatch {

        /** TelemetryBatch vehicleId */
        vehicleId?: (string|null);

        /** TelemetryBatch timestamp */
        timestamp?: (number|Long|null);

        /** TelemetryBatch points */
        points?: (telemetry.IDataPoint[]|null);
    }

    /** Represents a TelemetryBatch. */
    class TelemetryBatch implements ITelemetryBatch {

        /**
         * Constructs a new TelemetryBatch.
         * @param [properties] Properties to set
         */
        constructor(properties?: telemetry.ITelemetryBatch);

        /** TelemetryBatch vehicleId. */
        public vehicleId: string;

        /** TelemetryBatch timestamp. */
        public timestamp: (number|Long);

        /** TelemetryBatch points. */
        public points: telemetry.IDataPoint[];

        /**
         * Creates a new TelemetryBatch instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TelemetryBatch instance
         */
        public static create(properties?: telemetry.ITelemetryBatch): telemetry.TelemetryBatch;

        /**
         * Encodes the specified TelemetryBatch message. Does not implicitly {@link telemetry.TelemetryBatch.verify|verify} messages.
         * @param message TelemetryBatch message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: telemetry.ITelemetryBatch, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TelemetryBatch message, length delimited. Does not implicitly {@link telemetry.TelemetryBatch.verify|verify} messages.
         * @param message TelemetryBatch message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: telemetry.ITelemetryBatch, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TelemetryBatch message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TelemetryBatch
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): telemetry.TelemetryBatch;

        /**
         * Decodes a TelemetryBatch message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TelemetryBatch
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): telemetry.TelemetryBatch;

        /**
         * Verifies a TelemetryBatch message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TelemetryBatch message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TelemetryBatch
         */
        public static fromObject(object: { [k: string]: any }): telemetry.TelemetryBatch;

        /**
         * Creates a plain object from a TelemetryBatch message. Also converts values to other types if specified.
         * @param message TelemetryBatch
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: telemetry.TelemetryBatch, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TelemetryBatch to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for TelemetryBatch
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a DataPoint. */
    interface IDataPoint {

        /** DataPoint sensorId */
        sensorId?: (string|null);

        /** DataPoint value */
        value?: (number|null);
    }

    /** Represents a DataPoint. */
    class DataPoint implements IDataPoint {

        /**
         * Constructs a new DataPoint.
         * @param [properties] Properties to set
         */
        constructor(properties?: telemetry.IDataPoint);

        /** DataPoint sensorId. */
        public sensorId: string;

        /** DataPoint value. */
        public value: number;

        /**
         * Creates a new DataPoint instance using the specified properties.
         * @param [properties] Properties to set
         * @returns DataPoint instance
         */
        public static create(properties?: telemetry.IDataPoint): telemetry.DataPoint;

        /**
         * Encodes the specified DataPoint message. Does not implicitly {@link telemetry.DataPoint.verify|verify} messages.
         * @param message DataPoint message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: telemetry.IDataPoint, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified DataPoint message, length delimited. Does not implicitly {@link telemetry.DataPoint.verify|verify} messages.
         * @param message DataPoint message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: telemetry.IDataPoint, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a DataPoint message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns DataPoint
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): telemetry.DataPoint;

        /**
         * Decodes a DataPoint message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns DataPoint
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): telemetry.DataPoint;

        /**
         * Verifies a DataPoint message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a DataPoint message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns DataPoint
         */
        public static fromObject(object: { [k: string]: any }): telemetry.DataPoint;

        /**
         * Creates a plain object from a DataPoint message. Also converts values to other types if specified.
         * @param message DataPoint
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: telemetry.DataPoint, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this DataPoint to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for DataPoint
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a ServerAck. */
    interface IServerAck {

        /** ServerAck success */
        success?: (boolean|null);

        /** ServerAck errorMessage */
        errorMessage?: (string|null);

        /** ServerAck processingTimeMs */
        processingTimeMs?: (number|null);
    }

    /** Represents a ServerAck. */
    class ServerAck implements IServerAck {

        /**
         * Constructs a new ServerAck.
         * @param [properties] Properties to set
         */
        constructor(properties?: telemetry.IServerAck);

        /** ServerAck success. */
        public success: boolean;

        /** ServerAck errorMessage. */
        public errorMessage: string;

        /** ServerAck processingTimeMs. */
        public processingTimeMs: number;

        /**
         * Creates a new ServerAck instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ServerAck instance
         */
        public static create(properties?: telemetry.IServerAck): telemetry.ServerAck;

        /**
         * Encodes the specified ServerAck message. Does not implicitly {@link telemetry.ServerAck.verify|verify} messages.
         * @param message ServerAck message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: telemetry.IServerAck, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ServerAck message, length delimited. Does not implicitly {@link telemetry.ServerAck.verify|verify} messages.
         * @param message ServerAck message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: telemetry.IServerAck, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ServerAck message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ServerAck
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): telemetry.ServerAck;

        /**
         * Decodes a ServerAck message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ServerAck
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): telemetry.ServerAck;

        /**
         * Verifies a ServerAck message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ServerAck message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ServerAck
         */
        public static fromObject(object: { [k: string]: any }): telemetry.ServerAck;

        /**
         * Creates a plain object from a ServerAck message. Also converts values to other types if specified.
         * @param message ServerAck
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: telemetry.ServerAck, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ServerAck to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for ServerAck
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
