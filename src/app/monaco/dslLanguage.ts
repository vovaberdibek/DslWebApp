import * as monaco from 'monaco-editor';

export function registerDSLLanguage(monacoInstance: typeof monaco) {
  monacoInstance.languages.register({ id: 'mydsl' });

  monacoInstance.languages.setMonarchTokensProvider('mydsl', {
    keywords: [
      'Agents', 'Locations', 'Trays', 'Parameters',
      'TrayStepPoses', 'MainPoses', 'Assembly',
      'AddTray', 'AddTray2', 'PickTray', 'PositionTray',
      'OperatorPositionTray', 'RechargeSequence',
      'InternalScrewingSequence', 'ExternalScrewingSequence',
      'PlaceTray', 'LoadTray', 'BringTray', 'InitialAssemble',
      'FinishAssemble', 'Repeat', 'Speed'
    ],
    tokenizer: {
      root: [
        [/[{}()\[\]:,]/, 'delimiter'],
        [/\b\d+(\.\d+)?\b/, 'number'],
        [/"[^"]*"/, 'string'],
        [/[A-Za-z_]\w*/, {
          cases: {
            '@keywords': 'keyword',
            '@default': 'identifier'
          }
        }],
        [/\s+/, 'white'],
      ]
    }
  });

  monacoInstance.languages.setLanguageConfiguration('mydsl', {
    comments: { lineComment: '#', blockComment: ['/*','*/'] },
    brackets: [['[',']'], ['(',')'], ['{','}']],
    autoClosingPairs: [
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '{', close: '}' },
      { open: '"', close: '"' }
    ],
    surroundingPairs: [
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '{', close: '}' },
      { open: '"', close: '"' }
    ]
  });

  monacoInstance.languages.registerCompletionItemProvider('mydsl', {
    provideCompletionItems: () => ({
      suggestions: [
        'Agents:', 'Locations:', 'Trays:', 'Parameters:', 'TrayStepPoses:',
        'MainPoses:', 'Assembly:'
      ].map(w => ({
        label: w,
        kind: monacoInstance.languages.CompletionItemKind.Keyword,
        insertText: w
      }))
    })
  });
}

