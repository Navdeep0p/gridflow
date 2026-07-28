# GridFlow

GridFlow is a spatial puzzle game built using React, Vite, TypeScript, and Tailwind CSS, packaged for Android using Capacitor. Players rotate grid tiles to align directional energy flows across generated levels.

---

## Technical Overview

- **Core Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Mobile Bridge:** Capacitor 6 (`@capacitor/core`, `@capacitor/android`)
- **Native Integrations:** `@capacitor/haptics`, `@capacitor-community/admob`
- **Styling:** Tailwind CSS
- **CI/CD:** GitHub Actions pipeline targeting Android SDK / Gradle for automated release builds

---

## Releases & Downloads

Pre-compiled Android APKs are automatically generated for each tagged version via GitHub Actions.

- **Download Latest APK:** Visit the [Releases Page](https://github.com/Navdeep0p/gridflow/releases) to download the latest `.apk` file directly to your Android device.
- **Play Protect Notice:** When installing the standalone APK, Android's Play Protect may flag it as an untrusted source because it is built outside the Google Play Store. Tap **"Install anyway"** to complete the installation.

---

## Local Development Setup

### Prerequisites

- Node.js (v18+)
- npm or bun
- Android Studio (for native Android testing and device deployment)

### Instructions

1. Clone the repository:
   ```bash
   git clone [https://github.com/Navdeep0p/gridflow.git](https://github.com/Navdeep0p/gridflow.git)
   cd gridflow

### License & Attribution
This project is licensed under a Custom Source-Available License. See the LICENSE file for exact terms regarding mandatory attribution and usage restrictions.
