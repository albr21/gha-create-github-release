# gha-create-github-release

GitHub Action to create a GitHub release (tag + release notes)

## Usage

```yaml
steps:
  - name: Create GitHub Release
    uses: albr21/gha-create-github-release@1.0.0
    with:
      sha: ${{ github.sha }}
      tag: my-tag
      title: my-title
      body: |-
        my-body
```

## Contributing

Check out the [CONTRIBUTING](CONTRIBUTING.md) file for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
