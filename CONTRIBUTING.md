# Contributing to Conductr

Thank you for your interest in contributing to Conductr! We welcome contributions of all kinds—bug fixes, features, documentation, and ideas.

## 🎯 How to Contribute

### 1. **Reporting Issues**
- Check if the issue already exists
- Describe what you expected vs. what happened
- Include browser version, API model used, and steps to reproduce
- Provide error messages from browser console

### 2. **Suggesting Features**
- Describe the use case and why it matters
- Explain how it improves the user experience
- Consider the technical feasibility

### 3. **Submitting Code Changes**

#### Setup
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/conductr.git
cd conductr

# Start local server
python3 -m http.server 8080
```

#### Development Workflow
1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Test thoroughly (especially audio playback and AI generation)
4. Commit with clear messages: `git commit -m "Add: feature description"`
5. Push: `git push origin feature/your-feature-name`
6. Open a Pull Request with a description

#### Code Style
- Use clear, descriptive variable names
- Add comments for complex logic
- Keep functions focused and single-purpose
- Follow existing code patterns in the project

### 4. **Documentation**
- Update README.md if adding features
- Document new configuration options
- Add examples for new capabilities
- Update API documentation if modifying Claude prompts

## 🎨 Areas for Contribution

### High Priority
- [ ] Improve chord detection accuracy
- [ ] Better error handling and user feedback
- [ ] Mobile responsiveness improvements
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Performance optimization

### Medium Priority
- [ ] Additional musical styles
- [ ] More instrument track options
- [ ] Enhanced UI/UX
- [ ] Internationalization (translations)
- [ ] Better documentation

### Fun Projects
- [ ] Preset library system
- [ ] User gallery/sharing
- [ ] Music theory educational mode
- [ ] Collaboration features
- [ ] Export to music notation

## 📝 Commit Message Format

```
Type: Brief description

Longer explanation if needed.

- Bullet point for changes
- Another detail
```

**Types:**
- `Add:` - New feature
- `Fix:` - Bug fix
- `Improve:` - Enhancement to existing feature
- `Docs:` - Documentation changes
- `Refactor:` - Code reorganization without behavior change
- `Test:` - Test additions or fixes

## 🔍 Testing Checklist

Before submitting a PR:
- [ ] Feature works as intended
- [ ] No console errors
- [ ] Audio playback is clean
- [ ] API integration works
- [ ] UI is responsive
- [ ] Tested in at least 2 browsers

## 🎓 Code Architecture Guide

### Key Modules

**app.js** - Main controller
- Coordinates between modules
- Manages UI state and events
- Handles settings and preferences

**chord-engine.js** - Music theory
- Detects chords from note input
- Manages chord progression state
- Validates harmonic content

**ai-arranger.js** - Claude integration
- Sends chord progression to API
- Processes AI response
- Converts response to playable format

**playback-engine.js** - Audio rendering
- Manages Tone.js synths
- Controls playback state
- Renders WAV files

**piano-keyboard.js** - Input handling
- Virtual keyboard UI
- MIDI controller support
- Note selection and preview

**config.js** - Configuration
- Style definitions
- Track specifications
- Instrument parameters

## 🐛 Debugging Tips

1. **Open Browser DevTools** - F12 or Cmd+Option+I
2. **Check Console** - Look for errors and warnings
3. **Inspect Network** - Verify API calls succeed
4. **Profile Audio** - Check for distortion or glitches
5. **Test with Different Keys/Tempos** - Ensure consistency

## 📚 Resources

- [Tone.js Documentation](https://tonejs.org/)
- [Tonal.js Guide](https://github.com/tonaljs/tonal)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Claude API Docs](https://docs.anthropic.com)
- [Music Theory Basics](https://www.musictheory.net/)

## ✅ Pull Request Guidelines

1. **Title** - Clear, descriptive title
2. **Description** - What changed and why
3. **Related Issues** - Link any related issues
4. **Testing** - Explain how you tested
5. **Screenshots** - If UI changes, include before/after
6. **Breaking Changes** - Note any breaking changes

## 🤝 Code Review Process

- At least one maintainer review required
- Feedback provided constructively
- Multiple iterations expected (that's normal!)
- Once approved, code will be merged

## 🎉 Recognition

Contributors are recognized in:
- README.md acknowledgments
- GitHub contributor statistics
- Release notes for their contributions

## 📞 Questions?

- Start a GitHub Discussion
- Check existing issues/PRs
- Review code comments in relevant files

## 🙏 Thank You!

Every contribution helps make Conductr better. Whether it's a bug report, documentation fix, or major feature—it matters. Thank you for being part of this creative journey!

---

**Happy coding! Let's make AI music creation accessible to everyone.** 🎵✨
