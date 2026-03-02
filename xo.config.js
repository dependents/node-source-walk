'use strict';

module.exports = [
  {
    ignores: [
      'test/fixtures/**'
    ]
  },
  {
    space: 2,
    rules: {
      '@stylistic/comma-dangle': [
        'error',
        'never'
      ],
      '@stylistic/object-curly-spacing': [
        'error',
        'always'
      ],
      '@stylistic/operator-linebreak': [
        'error',
        'after'
      ],
      '@stylistic/spaced-comment': 'off',
      '@stylistic/space-before-function-paren': [
        'error',
        'never'
      ],
      camelcase: [
        'error',
        {
          properties: 'never'
        }
      ],
      'arrow-body-style': 'off',
      'capitalized-comments': 'off',
      curly: [
        'error',
        'multi-line'
      ],
      'prefer-template': 'error',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-node-protocol': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/prevent-abbreviations': 'off'
    }
  }
];
