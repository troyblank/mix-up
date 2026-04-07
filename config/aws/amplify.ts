import { type ResourcesConfig } from 'aws-amplify'

export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-2_gCByk7nYx',
      userPoolClientId: '1dhkoc75t5n2ae0892jjtd0gk5',
      identityPoolId: '',
    },
  },
} as ResourcesConfig
