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
        // Apollo GraphQL Client
        .package(url: "https://github.com/apollographql/apollo-ios.git", from: "1.9.0"),

        // WebSocket Client
        .package(url: "https://github.com/daltoniam/Starscream.git", from: "4.0.6"),

        // Keychain wrapper
        .package(url: "https://github.com/evgenyneu/keychain-swift.git", from: "20.0.0"),
    ],
    targets: [
        .target(
            name: "TideIOS",
            dependencies: [
                .product(name: "Apollo", package: "apollo-ios"),
                .product(name: "ApolloWebSocket", package: "apollo-ios"),
                .product(name: "Starscream", package: "Starscream"),
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
