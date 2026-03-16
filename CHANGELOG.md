# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.1] 2026-03-16

### Fixed

- Fix genogram crash with multi-spouse families by using layer-specific indices (#31)

## [1.1.0] 2026-03-12

### Added

- Add photo support for persons with upload and URL methods (#25)
- Add photo editing for existing persons (#25)
- Add photo cropping and compression utilities (#25)
- Enable translation and internationalization support (EN/ID) (#22)
- Add language switcher in UI (#22)
- Add toggle to show/hide Instagram handles (#20)
- Add color coding to family diagram (#20)
- Add nickname formatting with capitalization and number removal (#20)

### Fixed

- Fix sibling order preservation in family diagram (#27)
- Fix GitHub Actions CI cache service error (#26)
- Fix i18n initialization from cache (#22)

### Changed

- Reorganize source code structure into utils, hooks, and lang folders
- Update build configuration for proper root path (#26)

## [1.0.0] 2023-08-09

- Enable Open and Save for Family Data File (#17)
- Add Diagram Preview for Editing YAML (#17)
- Enable Edit of Tree YAML Using Modal (#15)
- Use LocalStorage to Store Tree Data in Browser Session (#13)
- Support Multiple Trees (#12)
- Add Tree via Modal (#12)
- Enable Delete Person (#9)
- Enable Edit Relation: Add Child and Spouse (#8)
- Add GoJS Genogram for Family Tree
- Create Initial Family Grid from YAML
