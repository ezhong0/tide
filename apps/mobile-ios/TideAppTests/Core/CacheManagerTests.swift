/**
 * Cache Manager Tests
 * Unit tests for the CacheManager service
 */

import XCTest
@testable import TideApp

@MainActor
final class CacheManagerTests: XCTestCase {

    var cacheManager: CacheManager!

    override func setUp() async throws {
        // Setup is done before each test
        cacheManager = CacheManager.shared
        cacheManager.clearAll() // Start with clean cache
    }

    override func tearDown() async throws {
        // Cleanup after each test
        cacheManager.clearAll()
    }

    // MARK: - Test Cases

    func testSetAndGet() {
        // Given: A test value
        struct TestData: Codable, Equatable {
            let id: String
            let name: String
        }
        let testData = TestData(id: "123", name: "Test")

        // When: Storing and retrieving from cache
        cacheManager.set(testData, forKey: "test_key")
        let retrieved = cacheManager.get(TestData.self, forKey: "test_key")

        // Then: Retrieved value should match
        XCTAssertEqual(retrieved, testData)
    }

    func testExpiredEntry() async {
        // Given: A cache entry with very short TTL
        struct TestData: Codable {
            let value: String
        }
        let testData = TestData(value: "test")

        // When: Storing with 0.1 second TTL and waiting
        cacheManager.set(testData, forKey: "expiring_key", ttl: 0.1)
        try? await Task.sleep(nanoseconds: 200_000_000) // Wait 0.2 seconds

        // Then: Entry should be expired and return nil
        let retrieved = cacheManager.get(TestData.self, forKey: "expiring_key")
        XCTAssertNil(retrieved)
    }

    func testRemove() {
        // Given: A cached value
        struct TestData: Codable {
            let value: String
        }
        let testData = TestData(value: "test")
        cacheManager.set(testData, forKey: "test_key")

        // When: Removing the entry
        cacheManager.remove(forKey: "test_key")

        // Then: Entry should not be retrievable
        let retrieved = cacheManager.get(TestData.self, forKey: "test_key")
        XCTAssertNil(retrieved)
    }

    func testClearAll() {
        // Given: Multiple cached values
        struct TestData: Codable {
            let value: String
        }
        cacheManager.set(TestData(value: "test1"), forKey: "key1")
        cacheManager.set(TestData(value: "test2"), forKey: "key2")

        // When: Clearing all cache
        cacheManager.clearAll()

        // Then: No entries should be retrievable
        XCTAssertNil(cacheManager.get(TestData.self, forKey: "key1"))
        XCTAssertNil(cacheManager.get(TestData.self, forKey: "key2"))
    }

    func testGetCacheSize() {
        // When: Getting cache size
        let size = cacheManager.getCacheSize()

        // Then: Size should be a valid string with " MB" suffix
        XCTAssertTrue(size.hasSuffix(" MB"))
    }
}
