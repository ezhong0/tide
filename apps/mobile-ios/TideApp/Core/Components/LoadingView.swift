/**
 * Loading View
 * Reusable loading indicators
 */

import SwiftUI

// MARK: - Loading Spinner

struct LoadingView: View {
    var body: some View {
        VStack(spacing: Spacing.md) {
            ProgressView()
                .scaleEffect(1.5)

            Text("Loading...")
                .font(.tideBodyMedium)
                .foregroundColor(.tideSecondaryText)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Loading Overlay

struct LoadingOverlay: View {
    var body: some View {
        ZStack {
            Color.black.opacity(0.3)
                .ignoresSafeArea()

            VStack(spacing: Spacing.md) {
                ProgressView()
                    .scaleEffect(1.5)
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))

                Text("Loading...")
                    .font(.tideBodyMedium)
                    .foregroundColor(.white)
            }
            .padding(Spacing.xl)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.black.opacity(0.8))
            )
        }
    }
}

// MARK: - Shimmer Effect

struct ShimmerView: View {
    @State private var phase: CGFloat = 0

    var body: some View {
        GeometryReader { geometry in
            LinearGradient(
                gradient: Gradient(colors: [
                    Color.gray.opacity(0.3),
                    Color.gray.opacity(0.1),
                    Color.gray.opacity(0.3)
                ]),
                startPoint: .leading,
                endPoint: .trailing
            )
            .frame(width: geometry.size.width * 2)
            .offset(x: phase * geometry.size.width * 2 - geometry.size.width)
            .onAppear {
                withAnimation(Animation.linear(duration: 1.5).repeatForever(autoreverses: false)) {
                    phase = 1
                }
            }
        }
        .cornerRadius(8)
    }
}

// MARK: - List Shimmer

struct ListShimmerView: View {
    let rows: Int

    init(rows: Int = 5) {
        self.rows = rows
    }

    var body: some View {
        VStack(spacing: Spacing.md) {
            ForEach(0..<rows, id: \.self) { _ in
                HStack(spacing: Spacing.md) {
                    ShimmerView()
                        .frame(width: 50, height: 50)
                        .cornerRadius(8)

                    VStack(alignment: .leading, spacing: Spacing.xs) {
                        ShimmerView()
                            .frame(height: 16)
                            .frame(maxWidth: .infinity)

                        ShimmerView()
                            .frame(height: 12)
                            .frame(width: 120)
                    }
                }
                .padding(Spacing.md)
                .background(Color.tideSurface)
                .cornerRadius(12)
            }
        }
        .padding(Spacing.md)
    }
}

// MARK: - Previews

struct LoadingView_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            LoadingView()
                .previewDisplayName("Loading View")

            LoadingOverlay()
                .previewDisplayName("Loading Overlay")

            ListShimmerView(rows: 3)
                .previewDisplayName("List Shimmer")
        }
    }
}
