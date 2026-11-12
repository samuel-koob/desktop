{
  "targets": [
    {
      "target_name": "printenvz",
      "type": "executable",
      "sources": [
        "src/printenvz.c"
      ],
      "include_dirs": [],
      'cflags': [
          '-Wall',
          '-Werror',
          '-fPIC',
          '-pie',
          # Ubuntu's gcc predefines _FORTIFY_SOURCE; gcc 11 errors on redefining it under -Werror.
          '-U_FORTIFY_SOURCE',
          '-D_FORTIFY_SOURCE=1',
          '-fstack-protector-strong',
          '-Werror=format-security',
        ],
      'ldflags': [
        '-z relro',
        '-z now'
      ],
      "conditions": [
        ["OS=='mac'", {
          "xcode_settings": {
            "OTHER_CFLAGS": [
              '-Wall',
              '-Werror',
              '-Werror=format-security',
              '-fPIC',
              '-D_FORTIFY_SOURCE=1',
              '-fstack-protector-strong'
            ],
            "MACOSX_DEPLOYMENT_TARGET": "10.7"
          }
        }]
      ]
    }
  ]
}
