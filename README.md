# ngx-testbedder

`ngx-testbedder` helps you to write the TestBed for an Angular (2.0+) application.

It displays a tree based on dependencies of a given file to this command. In addition, as you write integration tests in an Angular applications you can select the real modules and mock modules to use for testing. Then, the import statement necessary for that purpose and providers for a test bed are generated and output on the screen.

## Demo
![demo]

```
? Which module do you use as real? (Press <space> to select, <a> to toggle all, <i> to inverse selection)
❯◯ Done
 ◉ DetailComponent
 ◯ ├── AppActionsService
 ◯ ├── AppDispatcherService
 ◯ ├── AppStoreService
 ◯ ├── ProjectsActionsService
 ◯ └── ProjectsStoreService
```

The prompt displays a checkable dependency tree.

- Checked
  - We will use the real module in the test.
- Unchecked
  - We will replace it with a mock module in the test.
  
If you press the Enter key without checking `Done`, the tree will be updated with other modules that the real module depends on.

To complete, check `Done` and press the Enter key. Then, the result will be output.

## Installation

You can install `ngx-testbedder` command using npm.

```
$ npm install --global ngx-testbedder

# or to local

$ npm install --save-dev ngx-testbedder

```

**Requirements**: 

- Node.js 6.9.0+
- npm 3.0.0+

## Usage

```
$ testbedder ./src/app/app.component.ts

# or if you installed to local

$ $(npm bin)/testbedder ./src/app/app.component.ts
```

## API

### testbedder

```
$ testbedder [TypeScript file path] [Options]
```

#### Options

**`--tsconfig`**

**Alias:** `-c`

- You can specify a file path of `tsconfig.json`.
- As default, it will look for `./tsconfig.json`. If not found, search inside `./src/tsconfig.json`.

**`--verbose`**

**Alias:** `-v`

- It prints debug log verbose.
- Default is `false`

**`--tree`**

**Alias:** `-t`

- It displays only a tree.
- The prompt is not displayed.
- Default is `false`

**`--pattern`**

**Alias:** `--pt`

- You can specify a pattern to name mock file.
  - [angular-cli](https://github.com/angular/angular-cli) recommends `foo-bar.spec.ts` as name the spec file.
  - Similarly, we propose the name `foo-bar.mock.ts` to the mock file.
  - Please change this naming convention within the scope of the regular expression if you want.
- Default is `(.*)\.ts`

**`--replacement`**

**Alias:** `--rp`

- You can specify the replacement result for the above `--pattern`.
- Default is `$1.mock.ts`

**`--help`**

- It shows help.

**`--version`**

- It shows the version.

## Contributions

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT © [OKUNOKENTARO](https://github.com/armorik83)

[demo]: https://raw.githubusercontent.com/armorik83/ngx-testbedder/master/doc/demo.gif
