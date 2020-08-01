const configReader = require('../index')

test('Merged Config', () => {
  const mergedConf = configReader.getByFiles('config/merge1.yml', 'config/merge2.yml')
  expect(mergedConf).toEqual({
    stay: "foobar",
    override: 2,
    addObj: {
      var1: 123,
      var2: 456,
      var3: 789
    }
  })
})
