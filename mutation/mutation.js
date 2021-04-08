"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mutationWithClientMutationId = mutationWithClientMutationId;

var _graphql = require("graphql");

function resolveMaybeThunk(thingOrThunk) {
  return typeof thingOrThunk === 'function' ? // $FlowFixMe[incompatible-use] - if it's a function, we assume a thunk without arguments
  thingOrThunk() : thingOrThunk;
}
/**
 * A description of a mutation consumable by mutationWithClientMutationId
 * to create a GraphQLFieldConfig for that mutation.
 *
 * The inputFields and outputFields should not include `clientMutationId`,
 * as this will be provided automatically.
 *
 * An input object will be created containing the input fields, and an
 * object will be created containing the output fields.
 *
 * mutateAndGetPayload will receive an Object with a key for each
 * input field, and it should return an Object with a key for each
 * output field. It may return synchronously, or return a Promise.
 */


/**
 * Returns a GraphQLFieldConfig for the mutation described by the
 * provided MutationConfig.
 */
function mutationWithClientMutationId(config) {
  const {
    name,
    description,
    deprecationReason,
    inputFields,
    outputFields,
    mutateAndGetPayload
  } = config;

  const augmentedInputFields = () => ({ ...resolveMaybeThunk(inputFields),
    clientMutationId: {
      type: _graphql.GraphQLString
    }
  });

  const augmentedOutputFields = () => ({ ...resolveMaybeThunk(outputFields),
    clientMutationId: {
      type: _graphql.GraphQLString
    }
  });

  const outputType = new _graphql.GraphQLObjectType({
    name: name + 'Payload',
    fields: augmentedOutputFields
  });
  const inputType = new _graphql.GraphQLInputObjectType({
    name: name + 'Input',
    fields: augmentedInputFields
  });
  return {
    type: outputType,
    description,
    deprecationReason,
    args: {
      input: {
        type: new _graphql.GraphQLNonNull(inputType)
      }
    },
    resolve: (_, {
      input
    }, context, info) => {
      const {
        clientMutationId
      } = input;
      const payload = mutateAndGetPayload(input, context, info);

      if (isPromise(payload)) {
        return payload.then(data => ({ ...data,
          clientMutationId
        }));
      }

      return { ...payload,
        clientMutationId
      };
    }
  };
}

function isPromise(value) {
  return typeof (value === null || value === void 0 ? void 0 : value.then) === 'function';
}
