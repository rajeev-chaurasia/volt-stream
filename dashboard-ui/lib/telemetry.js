/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.telemetry = (function() {

    /**
     * Namespace telemetry.
     * @exports telemetry
     * @namespace
     */
    var telemetry = {};

    telemetry.TelemetryService = (function() {

        /**
         * Constructs a new TelemetryService service.
         * @memberof telemetry
         * @classdesc Represents a TelemetryService
         * @extends $protobuf.rpc.Service
         * @constructor
         * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
         * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
         * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
         */
        function TelemetryService(rpcImpl, requestDelimited, responseDelimited) {
            $protobuf.rpc.Service.call(this, rpcImpl, requestDelimited, responseDelimited);
        }

        (TelemetryService.prototype = Object.create($protobuf.rpc.Service.prototype)).constructor = TelemetryService;

        /**
         * Creates new TelemetryService service using the specified rpc implementation.
         * @function create
         * @memberof telemetry.TelemetryService
         * @static
         * @param {$protobuf.RPCImpl} rpcImpl RPC implementation
         * @param {boolean} [requestDelimited=false] Whether requests are length-delimited
         * @param {boolean} [responseDelimited=false] Whether responses are length-delimited
         * @returns {TelemetryService} RPC service. Useful where requests and/or responses are streamed.
         */
        TelemetryService.create = function create(rpcImpl, requestDelimited, responseDelimited) {
            return new this(rpcImpl, requestDelimited, responseDelimited);
        };

        /**
         * Callback as used by {@link telemetry.TelemetryService#streamTelemetry}.
         * @memberof telemetry.TelemetryService
         * @typedef StreamTelemetryCallback
         * @type {function}
         * @param {Error|null} error Error, if any
         * @param {telemetry.ServerAck} [response] ServerAck
         */

        /**
         * Calls StreamTelemetry.
         * @function streamTelemetry
         * @memberof telemetry.TelemetryService
         * @instance
         * @param {telemetry.ITelemetryBatch} request TelemetryBatch message or plain object
         * @param {telemetry.TelemetryService.StreamTelemetryCallback} callback Node-style callback called with the error, if any, and ServerAck
         * @returns {undefined}
         * @variation 1
         */
        Object.defineProperty(TelemetryService.prototype.streamTelemetry = function streamTelemetry(request, callback) {
            return this.rpcCall(streamTelemetry, $root.telemetry.TelemetryBatch, $root.telemetry.ServerAck, request, callback);
        }, "name", { value: "StreamTelemetry" });

        /**
         * Calls StreamTelemetry.
         * @function streamTelemetry
         * @memberof telemetry.TelemetryService
         * @instance
         * @param {telemetry.ITelemetryBatch} request TelemetryBatch message or plain object
         * @returns {Promise<telemetry.ServerAck>} Promise
         * @variation 2
         */

        return TelemetryService;
    })();

    telemetry.TelemetryBatch = (function() {

        /**
         * Properties of a TelemetryBatch.
         * @memberof telemetry
         * @interface ITelemetryBatch
         * @property {string|null} [vehicleId] TelemetryBatch vehicleId
         * @property {number|Long|null} [timestamp] TelemetryBatch timestamp
         * @property {Array.<telemetry.IDataPoint>|null} [points] TelemetryBatch points
         */

        /**
         * Constructs a new TelemetryBatch.
         * @memberof telemetry
         * @classdesc Represents a TelemetryBatch.
         * @implements ITelemetryBatch
         * @constructor
         * @param {telemetry.ITelemetryBatch=} [properties] Properties to set
         */
        function TelemetryBatch(properties) {
            this.points = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * TelemetryBatch vehicleId.
         * @member {string} vehicleId
         * @memberof telemetry.TelemetryBatch
         * @instance
         */
        TelemetryBatch.prototype.vehicleId = "";

        /**
         * TelemetryBatch timestamp.
         * @member {number|Long} timestamp
         * @memberof telemetry.TelemetryBatch
         * @instance
         */
        TelemetryBatch.prototype.timestamp = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * TelemetryBatch points.
         * @member {Array.<telemetry.IDataPoint>} points
         * @memberof telemetry.TelemetryBatch
         * @instance
         */
        TelemetryBatch.prototype.points = $util.emptyArray;

        /**
         * Creates a new TelemetryBatch instance using the specified properties.
         * @function create
         * @memberof telemetry.TelemetryBatch
         * @static
         * @param {telemetry.ITelemetryBatch=} [properties] Properties to set
         * @returns {telemetry.TelemetryBatch} TelemetryBatch instance
         */
        TelemetryBatch.create = function create(properties) {
            return new TelemetryBatch(properties);
        };

        /**
         * Encodes the specified TelemetryBatch message. Does not implicitly {@link telemetry.TelemetryBatch.verify|verify} messages.
         * @function encode
         * @memberof telemetry.TelemetryBatch
         * @static
         * @param {telemetry.ITelemetryBatch} message TelemetryBatch message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TelemetryBatch.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.vehicleId != null && Object.hasOwnProperty.call(message, "vehicleId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.vehicleId);
            if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.timestamp);
            if (message.points != null && message.points.length)
                for (var i = 0; i < message.points.length; ++i)
                    $root.telemetry.DataPoint.encode(message.points[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified TelemetryBatch message, length delimited. Does not implicitly {@link telemetry.TelemetryBatch.verify|verify} messages.
         * @function encodeDelimited
         * @memberof telemetry.TelemetryBatch
         * @static
         * @param {telemetry.ITelemetryBatch} message TelemetryBatch message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        TelemetryBatch.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a TelemetryBatch message from the specified reader or buffer.
         * @function decode
         * @memberof telemetry.TelemetryBatch
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {telemetry.TelemetryBatch} TelemetryBatch
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TelemetryBatch.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.telemetry.TelemetryBatch();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.vehicleId = reader.string();
                        break;
                    }
                case 2: {
                        message.timestamp = reader.int64();
                        break;
                    }
                case 3: {
                        if (!(message.points && message.points.length))
                            message.points = [];
                        message.points.push($root.telemetry.DataPoint.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a TelemetryBatch message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof telemetry.TelemetryBatch
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {telemetry.TelemetryBatch} TelemetryBatch
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        TelemetryBatch.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a TelemetryBatch message.
         * @function verify
         * @memberof telemetry.TelemetryBatch
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        TelemetryBatch.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.vehicleId != null && message.hasOwnProperty("vehicleId"))
                if (!$util.isString(message.vehicleId))
                    return "vehicleId: string expected";
            if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                if (!$util.isInteger(message.timestamp) && !(message.timestamp && $util.isInteger(message.timestamp.low) && $util.isInteger(message.timestamp.high)))
                    return "timestamp: integer|Long expected";
            if (message.points != null && message.hasOwnProperty("points")) {
                if (!Array.isArray(message.points))
                    return "points: array expected";
                for (var i = 0; i < message.points.length; ++i) {
                    var error = $root.telemetry.DataPoint.verify(message.points[i]);
                    if (error)
                        return "points." + error;
                }
            }
            return null;
        };

        /**
         * Creates a TelemetryBatch message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof telemetry.TelemetryBatch
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {telemetry.TelemetryBatch} TelemetryBatch
         */
        TelemetryBatch.fromObject = function fromObject(object) {
            if (object instanceof $root.telemetry.TelemetryBatch)
                return object;
            var message = new $root.telemetry.TelemetryBatch();
            if (object.vehicleId != null)
                message.vehicleId = String(object.vehicleId);
            if (object.timestamp != null)
                if ($util.Long)
                    (message.timestamp = $util.Long.fromValue(object.timestamp)).unsigned = false;
                else if (typeof object.timestamp === "string")
                    message.timestamp = parseInt(object.timestamp, 10);
                else if (typeof object.timestamp === "number")
                    message.timestamp = object.timestamp;
                else if (typeof object.timestamp === "object")
                    message.timestamp = new $util.LongBits(object.timestamp.low >>> 0, object.timestamp.high >>> 0).toNumber();
            if (object.points) {
                if (!Array.isArray(object.points))
                    throw TypeError(".telemetry.TelemetryBatch.points: array expected");
                message.points = [];
                for (var i = 0; i < object.points.length; ++i) {
                    if (typeof object.points[i] !== "object")
                        throw TypeError(".telemetry.TelemetryBatch.points: object expected");
                    message.points[i] = $root.telemetry.DataPoint.fromObject(object.points[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a TelemetryBatch message. Also converts values to other types if specified.
         * @function toObject
         * @memberof telemetry.TelemetryBatch
         * @static
         * @param {telemetry.TelemetryBatch} message TelemetryBatch
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        TelemetryBatch.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.points = [];
            if (options.defaults) {
                object.vehicleId = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.timestamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.timestamp = options.longs === String ? "0" : 0;
            }
            if (message.vehicleId != null && message.hasOwnProperty("vehicleId"))
                object.vehicleId = message.vehicleId;
            if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                if (typeof message.timestamp === "number")
                    object.timestamp = options.longs === String ? String(message.timestamp) : message.timestamp;
                else
                    object.timestamp = options.longs === String ? $util.Long.prototype.toString.call(message.timestamp) : options.longs === Number ? new $util.LongBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0).toNumber() : message.timestamp;
            if (message.points && message.points.length) {
                object.points = [];
                for (var j = 0; j < message.points.length; ++j)
                    object.points[j] = $root.telemetry.DataPoint.toObject(message.points[j], options);
            }
            return object;
        };

        /**
         * Converts this TelemetryBatch to JSON.
         * @function toJSON
         * @memberof telemetry.TelemetryBatch
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        TelemetryBatch.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for TelemetryBatch
         * @function getTypeUrl
         * @memberof telemetry.TelemetryBatch
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        TelemetryBatch.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/telemetry.TelemetryBatch";
        };

        return TelemetryBatch;
    })();

    telemetry.DataPoint = (function() {

        /**
         * Properties of a DataPoint.
         * @memberof telemetry
         * @interface IDataPoint
         * @property {string|null} [sensorId] DataPoint sensorId
         * @property {number|null} [value] DataPoint value
         */

        /**
         * Constructs a new DataPoint.
         * @memberof telemetry
         * @classdesc Represents a DataPoint.
         * @implements IDataPoint
         * @constructor
         * @param {telemetry.IDataPoint=} [properties] Properties to set
         */
        function DataPoint(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DataPoint sensorId.
         * @member {string} sensorId
         * @memberof telemetry.DataPoint
         * @instance
         */
        DataPoint.prototype.sensorId = "";

        /**
         * DataPoint value.
         * @member {number} value
         * @memberof telemetry.DataPoint
         * @instance
         */
        DataPoint.prototype.value = 0;

        /**
         * Creates a new DataPoint instance using the specified properties.
         * @function create
         * @memberof telemetry.DataPoint
         * @static
         * @param {telemetry.IDataPoint=} [properties] Properties to set
         * @returns {telemetry.DataPoint} DataPoint instance
         */
        DataPoint.create = function create(properties) {
            return new DataPoint(properties);
        };

        /**
         * Encodes the specified DataPoint message. Does not implicitly {@link telemetry.DataPoint.verify|verify} messages.
         * @function encode
         * @memberof telemetry.DataPoint
         * @static
         * @param {telemetry.IDataPoint} message DataPoint message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DataPoint.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.sensorId != null && Object.hasOwnProperty.call(message, "sensorId"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.sensorId);
            if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                writer.uint32(/* id 2, wireType 1 =*/17).double(message.value);
            return writer;
        };

        /**
         * Encodes the specified DataPoint message, length delimited. Does not implicitly {@link telemetry.DataPoint.verify|verify} messages.
         * @function encodeDelimited
         * @memberof telemetry.DataPoint
         * @static
         * @param {telemetry.IDataPoint} message DataPoint message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DataPoint.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a DataPoint message from the specified reader or buffer.
         * @function decode
         * @memberof telemetry.DataPoint
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {telemetry.DataPoint} DataPoint
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DataPoint.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.telemetry.DataPoint();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.sensorId = reader.string();
                        break;
                    }
                case 2: {
                        message.value = reader.double();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a DataPoint message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof telemetry.DataPoint
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {telemetry.DataPoint} DataPoint
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DataPoint.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a DataPoint message.
         * @function verify
         * @memberof telemetry.DataPoint
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DataPoint.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.sensorId != null && message.hasOwnProperty("sensorId"))
                if (!$util.isString(message.sensorId))
                    return "sensorId: string expected";
            if (message.value != null && message.hasOwnProperty("value"))
                if (typeof message.value !== "number")
                    return "value: number expected";
            return null;
        };

        /**
         * Creates a DataPoint message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof telemetry.DataPoint
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {telemetry.DataPoint} DataPoint
         */
        DataPoint.fromObject = function fromObject(object) {
            if (object instanceof $root.telemetry.DataPoint)
                return object;
            var message = new $root.telemetry.DataPoint();
            if (object.sensorId != null)
                message.sensorId = String(object.sensorId);
            if (object.value != null)
                message.value = Number(object.value);
            return message;
        };

        /**
         * Creates a plain object from a DataPoint message. Also converts values to other types if specified.
         * @function toObject
         * @memberof telemetry.DataPoint
         * @static
         * @param {telemetry.DataPoint} message DataPoint
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DataPoint.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.sensorId = "";
                object.value = 0;
            }
            if (message.sensorId != null && message.hasOwnProperty("sensorId"))
                object.sensorId = message.sensorId;
            if (message.value != null && message.hasOwnProperty("value"))
                object.value = options.json && !isFinite(message.value) ? String(message.value) : message.value;
            return object;
        };

        /**
         * Converts this DataPoint to JSON.
         * @function toJSON
         * @memberof telemetry.DataPoint
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DataPoint.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for DataPoint
         * @function getTypeUrl
         * @memberof telemetry.DataPoint
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        DataPoint.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/telemetry.DataPoint";
        };

        return DataPoint;
    })();

    telemetry.ServerAck = (function() {

        /**
         * Properties of a ServerAck.
         * @memberof telemetry
         * @interface IServerAck
         * @property {boolean|null} [success] ServerAck success
         * @property {string|null} [errorMessage] ServerAck errorMessage
         * @property {number|null} [processingTimeMs] ServerAck processingTimeMs
         */

        /**
         * Constructs a new ServerAck.
         * @memberof telemetry
         * @classdesc Represents a ServerAck.
         * @implements IServerAck
         * @constructor
         * @param {telemetry.IServerAck=} [properties] Properties to set
         */
        function ServerAck(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ServerAck success.
         * @member {boolean} success
         * @memberof telemetry.ServerAck
         * @instance
         */
        ServerAck.prototype.success = false;

        /**
         * ServerAck errorMessage.
         * @member {string} errorMessage
         * @memberof telemetry.ServerAck
         * @instance
         */
        ServerAck.prototype.errorMessage = "";

        /**
         * ServerAck processingTimeMs.
         * @member {number} processingTimeMs
         * @memberof telemetry.ServerAck
         * @instance
         */
        ServerAck.prototype.processingTimeMs = 0;

        /**
         * Creates a new ServerAck instance using the specified properties.
         * @function create
         * @memberof telemetry.ServerAck
         * @static
         * @param {telemetry.IServerAck=} [properties] Properties to set
         * @returns {telemetry.ServerAck} ServerAck instance
         */
        ServerAck.create = function create(properties) {
            return new ServerAck(properties);
        };

        /**
         * Encodes the specified ServerAck message. Does not implicitly {@link telemetry.ServerAck.verify|verify} messages.
         * @function encode
         * @memberof telemetry.ServerAck
         * @static
         * @param {telemetry.IServerAck} message ServerAck message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ServerAck.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.success != null && Object.hasOwnProperty.call(message, "success"))
                writer.uint32(/* id 1, wireType 0 =*/8).bool(message.success);
            if (message.errorMessage != null && Object.hasOwnProperty.call(message, "errorMessage"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.errorMessage);
            if (message.processingTimeMs != null && Object.hasOwnProperty.call(message, "processingTimeMs"))
                writer.uint32(/* id 3, wireType 0 =*/24).int32(message.processingTimeMs);
            return writer;
        };

        /**
         * Encodes the specified ServerAck message, length delimited. Does not implicitly {@link telemetry.ServerAck.verify|verify} messages.
         * @function encodeDelimited
         * @memberof telemetry.ServerAck
         * @static
         * @param {telemetry.IServerAck} message ServerAck message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ServerAck.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ServerAck message from the specified reader or buffer.
         * @function decode
         * @memberof telemetry.ServerAck
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {telemetry.ServerAck} ServerAck
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ServerAck.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.telemetry.ServerAck();
            while (reader.pos < end) {
                var tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.success = reader.bool();
                        break;
                    }
                case 2: {
                        message.errorMessage = reader.string();
                        break;
                    }
                case 3: {
                        message.processingTimeMs = reader.int32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ServerAck message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof telemetry.ServerAck
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {telemetry.ServerAck} ServerAck
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ServerAck.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ServerAck message.
         * @function verify
         * @memberof telemetry.ServerAck
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ServerAck.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.success != null && message.hasOwnProperty("success"))
                if (typeof message.success !== "boolean")
                    return "success: boolean expected";
            if (message.errorMessage != null && message.hasOwnProperty("errorMessage"))
                if (!$util.isString(message.errorMessage))
                    return "errorMessage: string expected";
            if (message.processingTimeMs != null && message.hasOwnProperty("processingTimeMs"))
                if (!$util.isInteger(message.processingTimeMs))
                    return "processingTimeMs: integer expected";
            return null;
        };

        /**
         * Creates a ServerAck message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof telemetry.ServerAck
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {telemetry.ServerAck} ServerAck
         */
        ServerAck.fromObject = function fromObject(object) {
            if (object instanceof $root.telemetry.ServerAck)
                return object;
            var message = new $root.telemetry.ServerAck();
            if (object.success != null)
                message.success = Boolean(object.success);
            if (object.errorMessage != null)
                message.errorMessage = String(object.errorMessage);
            if (object.processingTimeMs != null)
                message.processingTimeMs = object.processingTimeMs | 0;
            return message;
        };

        /**
         * Creates a plain object from a ServerAck message. Also converts values to other types if specified.
         * @function toObject
         * @memberof telemetry.ServerAck
         * @static
         * @param {telemetry.ServerAck} message ServerAck
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ServerAck.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.success = false;
                object.errorMessage = "";
                object.processingTimeMs = 0;
            }
            if (message.success != null && message.hasOwnProperty("success"))
                object.success = message.success;
            if (message.errorMessage != null && message.hasOwnProperty("errorMessage"))
                object.errorMessage = message.errorMessage;
            if (message.processingTimeMs != null && message.hasOwnProperty("processingTimeMs"))
                object.processingTimeMs = message.processingTimeMs;
            return object;
        };

        /**
         * Converts this ServerAck to JSON.
         * @function toJSON
         * @memberof telemetry.ServerAck
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ServerAck.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for ServerAck
         * @function getTypeUrl
         * @memberof telemetry.ServerAck
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        ServerAck.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/telemetry.ServerAck";
        };

        return ServerAck;
    })();

    return telemetry;
})();

module.exports = $root;
