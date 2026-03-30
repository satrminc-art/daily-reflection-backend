import SwiftUI

struct PremiumPaywallView: View {
  @State private var hasAppeared = false

  var onStartTrial: () -> Void = {}
  var onUnlockLifetime: () -> Void = {}
  var onContinueFree: () -> Void = {}
  var onRestorePurchases: () -> Void = {}

  var body: some View {
    ScrollView(showsIndicators: false) {
      VStack(alignment: .leading, spacing: 24) {
        heroSection
          .modifier(FadeSlideIn(delay: 0.02, isVisible: hasAppeared))

        TransformationSection()
          .modifier(FadeSlideIn(delay: 0.12, isVisible: hasAppeared))

        PremiumOfferCard(action: onStartTrial)
          .modifier(FadeSlideIn(delay: 0.2, isVisible: hasAppeared))

        LifetimeOfferCard(action: onUnlockLifetime)
          .modifier(FadeSlideIn(delay: 0.28, isVisible: hasAppeared))

        freeSection
          .modifier(FadeSlideIn(delay: 0.34, isVisible: hasAppeared))

        restoreSection
          .modifier(FadeSlideIn(delay: 0.4, isVisible: hasAppeared))
      }
      .padding(.horizontal, 24)
      .padding(.top, 28)
      .padding(.bottom, 36)
    }
    .background(PaywallPalette.background.ignoresSafeArea())
    .onAppear {
      withAnimation(.easeOut(duration: 0.5)) {
        hasAppeared = true
      }
    }
  }

  private var heroSection: some View {
    VStack(alignment: .leading, spacing: 14) {
      Text("Keep what would otherwise be lost.")
        .font(.custom("Georgia", size: 34))
        .foregroundStyle(PaywallPalette.primaryText)
        .lineSpacing(4)

      Text("Your thoughts. Your space. Yours to keep.")
        .font(.system(size: 16, weight: .regular, design: .default))
        .foregroundStyle(PaywallPalette.secondaryText)
        .lineSpacing(4)
        .fixedSize(horizontal: false, vertical: true)
    }
    .padding(.top, 8)
  }

  private var freeSection: some View {
    VStack(alignment: .leading, spacing: 10) {
      Text("Continue for free")
        .font(.system(size: 15, weight: .semibold))
        .foregroundStyle(PaywallPalette.primaryText)

      Text("One page at a time")
        .font(.system(size: 14, weight: .regular))
        .foregroundStyle(PaywallPalette.secondaryText)

      Button(action: onContinueFree) {
        Text("Continue for free")
          .font(.system(size: 15, weight: .semibold))
          .foregroundStyle(PaywallPalette.primaryText)
          .underline()
      }
      .buttonStyle(.plain)
      .padding(.top, 2)
    }
    .padding(.top, 4)
  }

  private var restoreSection: some View {
    Button(action: onRestorePurchases) {
      Text("Restore purchases")
        .font(.system(size: 14, weight: .medium))
        .foregroundStyle(PaywallPalette.secondaryText)
        .underline()
    }
    .buttonStyle(.plain)
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(.top, 2)
  }
}

private struct TransformationSection: View {
  private let pairs: [(String, String)] = [
    ("Thoughts disappear", "they stay"),
    ("Mental noise", "clarity"),
    ("Scattered ideas", "one place"),
    ("Forgetting", "remembering")
  ]

  var body: some View {
    VStack(alignment: .leading, spacing: 16) {
      Text("What changes")
        .font(.custom("Georgia", size: 22))
        .foregroundStyle(PaywallPalette.primaryText)

      VStack(alignment: .leading, spacing: 12) {
        ForEach(pairs, id: \.0) { before, after in
          HStack(alignment: .firstTextBaseline, spacing: 10) {
            Text(before)
              .font(.system(size: 15, weight: .regular))
              .foregroundStyle(PaywallPalette.secondaryText)
            Text("→")
              .font(.system(size: 14, weight: .medium))
              .foregroundStyle(PaywallPalette.accent)
            Text(after)
              .font(.system(size: 15, weight: .semibold))
              .foregroundStyle(PaywallPalette.primaryText)
          }
        }
      }
      .padding(20)
      .background(PaywallPalette.surface)
      .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
      .overlay(
        RoundedRectangle(cornerRadius: 24, style: .continuous)
          .stroke(PaywallPalette.border, lineWidth: 1)
      )
    }
  }
}

private struct PremiumOfferCard: View {
  var action: () -> Void

  private let benefits = [
    "Unlimited pages",
    "Personal space",
    "Custom design",
    "Everything stays"
  ]

  var body: some View {
    VStack(alignment: .leading, spacing: 16) {
      Text("More space. More depth.")
        .font(.custom("Georgia", size: 28))
        .foregroundStyle(PaywallPalette.primaryText)

      VStack(alignment: .leading, spacing: 10) {
        ForEach(benefits, id: \.self) { benefit in
          HStack(alignment: .top, spacing: 10) {
            Circle()
              .fill(PaywallPalette.accent.opacity(0.26))
              .frame(width: 8, height: 8)
              .padding(.top, 7)
            Text(benefit)
              .font(.system(size: 15, weight: .regular))
              .foregroundStyle(PaywallPalette.primaryText)
          }
        }
      }

      VStack(alignment: .leading, spacing: 4) {
        Text("Free for 7 days. Cancel anytime.")
          .font(.system(size: 13, weight: .medium))
          .foregroundStyle(PaywallPalette.secondaryText)
      }

      Button(action: action) {
        Text("Start free trial")
          .font(.system(size: 16, weight: .semibold))
          .foregroundStyle(PaywallPalette.buttonText)
          .frame(maxWidth: .infinity)
          .frame(height: 56)
          .background(PaywallPalette.accent)
          .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
          .shadow(color: PaywallPalette.shadow, radius: 18, x: 0, y: 10)
      }
      .buttonStyle(ScaleButtonStyle())
    }
    .padding(24)
    .background(PaywallPalette.surfaceStrong)
    .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
    .overlay(
      RoundedRectangle(cornerRadius: 28, style: .continuous)
        .stroke(PaywallPalette.borderStrong, lineWidth: 1)
    )
  }
}

private struct LifetimeOfferCard: View {
  var action: () -> Void

  var body: some View {
    VStack(alignment: .leading, spacing: 14) {
      HStack(alignment: .center, spacing: 10) {
        Text("One time. Forever.")
          .font(.custom("Georgia", size: 24))
          .foregroundStyle(PaywallPalette.primaryText)

        Spacer(minLength: 8)

        Text("SUPPORTER")
          .font(.system(size: 10, weight: .bold))
          .kerning(1.2)
          .foregroundStyle(PaywallPalette.accent)
          .padding(.horizontal, 10)
          .padding(.vertical, 6)
          .background(PaywallPalette.accent.opacity(0.12))
          .clipShape(Capsule())
      }

      Text("A space that belongs to you.")
        .font(.system(size: 15, weight: .medium))
        .foregroundStyle(PaywallPalette.primaryText)

      Text("Unlock forever")
        .font(.system(size: 14, weight: .regular))
        .foregroundStyle(PaywallPalette.secondaryText)

      Button(action: action) {
        Text("Unlock forever")
          .font(.system(size: 15, weight: .semibold))
          .foregroundStyle(PaywallPalette.primaryText)
          .padding(.horizontal, 18)
          .frame(height: 50)
          .background(PaywallPalette.surface)
          .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
          .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
              .stroke(PaywallPalette.borderStrong, lineWidth: 1)
          )
      }
      .buttonStyle(ScaleButtonStyle())
    }
    .padding(22)
    .background(PaywallPalette.surface)
    .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
    .overlay(
      RoundedRectangle(cornerRadius: 24, style: .continuous)
        .stroke(PaywallPalette.border, lineWidth: 1)
    )
  }
}

private struct FadeSlideIn: ViewModifier {
  let delay: Double
  let isVisible: Bool

  func body(content: Content) -> some View {
    content
      .opacity(isVisible ? 1 : 0)
      .scaleEffect(isVisible ? 1 : 0.985, anchor: .center)
      .offset(y: isVisible ? 0 : 10)
      .animation(.easeOut(duration: 0.48).delay(delay), value: isVisible)
  }
}

private struct ScaleButtonStyle: ButtonStyle {
  func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .scaleEffect(configuration.isPressed ? 0.985 : 1)
      .animation(.easeOut(duration: 0.18), value: configuration.isPressed)
  }
}

private enum PaywallPalette {
  static let background = Color(red: 247 / 255, green: 245 / 255, blue: 240 / 255)
  static let surface = Color.white.opacity(0.78)
  static let surfaceStrong = Color(red: 250 / 255, green: 248 / 255, blue: 244 / 255)
  static let primaryText = Color(red: 49 / 255, green: 42 / 255, blue: 35 / 255)
  static let secondaryText = Color(red: 105 / 255, green: 94 / 255, blue: 83 / 255)
  static let accent = Color(red: 174 / 255, green: 143 / 255, blue: 114 / 255)
  static let buttonText = Color.white
  static let border = Color(red: 221 / 255, green: 213 / 255, blue: 202 / 255)
  static let borderStrong = Color(red: 206 / 255, green: 193 / 255, blue: 179 / 255)
  static let shadow = Color.black.opacity(0.08)
}

#Preview {
  PremiumPaywallView()
}
