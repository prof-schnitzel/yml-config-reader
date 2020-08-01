const configReader = require('../index')

test('Basic Config', () => {
  const basicConf = configReader.getByEnv('basic', 'config')
  expect(basicConf).toEqual({
    restUrl: "www.example.com",
    app1: {
      id: "custom-app",
      url: "www.example.com/app1"
    },
    allowedAuths: ["basic", "jwt"]
  })
})
