package com.fraud.engine.redis;

import com.fraud.common.model.Transaction;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class RedisState {

    private final StringRedisTemplate redis;

    // Store this tx in a per-user ZSET scored by epoch seconds
    public void recordTransactionTime(String userId, long epochSec) {
        String key = "user:%s:tx_times".formatted(userId);
        redis.opsForZSet().add(key, String.valueOf(epochSec), epochSec);
        // Keep only recent time range (e.g., last 24h)
        long cutoff = epochSec - 24 * 3600;
        redis.opsForZSet().removeRangeByScore(key, 0, cutoff);
        redis.expire(key, 2, TimeUnit.DAYS);
    }

    // Count how many tx in last N seconds
    public long recentCount(String userId, long nowSec, long windowSec) {
        String key = "user:%s:tx_times".formatted(userId);
        return redis.opsForZSet().count(key, nowSec - windowSec, nowSec);
    }

    public boolean firstSeenDevice(String userId, String deviceId) {
        if (deviceId == null || deviceId.isBlank())
            return false;
        String key = "user:%s:devices".formatted(userId);
        Long added = redis.opsForSet().add(key, deviceId); // returns Long
        redis.expire(key, 90, TimeUnit.DAYS);
        return added != null && added > 0; // true if newly added
    }

    public boolean firstSeenIp(String userId, String ip) {
        if (ip == null || ip.isBlank())
            return false;
        String key = "user:%s:ips".formatted(userId);
        Long added = redis.opsForSet().add(key, ip); // returns Long
        redis.expire(key, 90, TimeUnit.DAYS);
        return added != null && added > 0; // true if newly added
    }

    // Store and fetch last location
    public static record LastLoc(double lat, double lon, long epochSec) {
    }

    public LastLoc getLastLoc(String userId) {
        String key = "user:%s:last_loc".formatted(userId);
        var lat = redis.opsForHash().get(key, "lat");
        var lon = redis.opsForHash().get(key, "lon");
        var ts = redis.opsForHash().get(key, "ts");
        if (lat == null || lon == null || ts == null)
            return null;
        try {
            return new LastLoc(Double.parseDouble(lat.toString()),
                    Double.parseDouble(lon.toString()),
                    Long.parseLong(ts.toString()));
        } catch (Exception e) {
            return null;
        }
    }

    public void setLastLoc(String userId, double lat, double lon, long epochSec) {
        String key = "user:%s:last_loc".formatted(userId);
        redis.opsForHash().put(key, "lat", String.valueOf(lat));
        redis.opsForHash().put(key, "lon", String.valueOf(lon));
        redis.opsForHash().put(key, "ts", String.valueOf(epochSec));
        redis.expire(key, 30, TimeUnit.DAYS);
    }

    public static double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
