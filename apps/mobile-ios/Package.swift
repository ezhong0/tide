// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "TideIOS",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(
            name: "TideIOS",
            targets: ["TideIOS"]
        )
    ],
    dependencies: [
        // Supabase Swift SDK (replaces Apollo + Starscream)
        .package(url: "https://github.com/supabase/supabase-swift.git", from: "2.5.0"),

        // Keychain wrapper (keep for secure storage)
        .package(url: "https://github.com/evgenyneu/keychain-swift.git", from: "20.0.0"),
    ],
    targets: [
        .target(
            name: "TideIOS",
            dependencies: [
                .product(name: "Supabase", package: "supabase-swift"),
                .product(name: "KeychainSwift", package: "keychain-swift"),
            ],
            path: "."
        ),
        .testTarget(
            name: "TideIOSTests",
            dependencies: ["TideIOS"]
        )
    ]
)
