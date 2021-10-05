/* eslint-disable */
const path = require('path')


module.exports = {
  rootDir: path.resolve(__dirname),
  preset: 'ts-jest',
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // 测试文件
  testMatch: ['<rootDir>/test/unit/*.spec.ts?(x)']
}
