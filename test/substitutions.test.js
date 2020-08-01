const configReader = require('../index')

test('Substituted Config', () => {
  const conf = configReader.getByFiles('config/substitution1.yml', 'config/substitution2.yml')
  expect(conf).toEqual({
    app1: {
      url: "app1.api.test.com"
    },
    app2: {
      url: "app2.api.test.com"
    },
    stage: "test",
    allStages: ["test", "qa", "prod"],
    baseUrl: "api.test.com",
    home: "test.com/test"
  })
})

test('Missing substitution', () => {
  expect(() => configReader.getByFiles('config/substitution2.yml'))
    .toThrow('Property stage not found in any config file.')
})
