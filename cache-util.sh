#!/bin/bash

# ANSI color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== FirmSync Cache Utility ===${NC}"

# Default Redis connection
REDIS_URL="${REDIS_URL:-redis://localhost:6379}"

# Check if redis-cli is installed
if ! command -v redis-cli &> /dev/null; then
    echo -e "${RED}Error: redis-cli is not installed. Please install Redis tools.${NC}"
    exit 1
fi

# Parse Redis URL to get host and port
if [[ $REDIS_URL =~ redis://([^:]+):([0-9]+) ]]; then
    REDIS_HOST="${BASH_REMATCH[1]}"
    REDIS_PORT="${BASH_REMATCH[2]}"
else
    echo -e "${RED}Error: Unable to parse Redis URL. Using default localhost:6379${NC}"
    REDIS_HOST="localhost"
    REDIS_PORT="6379"
fi

# Function to clear all cache
clear_all_cache() {
    echo -e "${BLUE}Clearing all cache...${NC}"
    
    KEYS_COUNT=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" DBSIZE)
    
    redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" FLUSHALL
    
    echo -e "${GREEN}Cache cleared successfully. Removed $KEYS_COUNT keys.${NC}"
}

# Function to clear specific cache types
clear_specific_cache() {
    local pattern=$1
    local description=$2
    
    echo -e "${BLUE}Finding keys matching pattern: $pattern${NC}"
    
    # Count keys before deletion
    local keys_count=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" KEYS "$pattern" | wc -l)
    
    # Delete keys
    if [ "$keys_count" -gt 0 ]; then
        redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" KEYS "$pattern" | xargs redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" DEL
        echo -e "${GREEN}Cleared $keys_count $description cache entries${NC}"
    else
        echo -e "${BLUE}No $description cache entries found${NC}"
    fi
}

# Check command line arguments
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    echo -e "\n${BLUE}FirmSync Cache Utility${NC}"
    echo -e "\nUsage: $0 [option]"
    echo -e "\nOptions:"
    echo -e "  --all       Clear all cache"
    echo -e "  --users     Clear user cache"
    echo -e "  --firms     Clear firm cache"
    echo -e "  --tokens    Clear token cache"
    echo -e "  --help      Show this help message"
    echo -e "\nEnvironment Variables:"
    echo -e "  REDIS_URL   Redis connection URL (default: redis://localhost:6379)"
    exit 0
fi

# Execute based on arguments
case "$1" in
    "--all")
        clear_all_cache
        ;;
    "--users")
        clear_specific_cache "user:*" "user"
        ;;
    "--firms")
        clear_specific_cache "firm:*" "firm"
        ;;
    "--tokens")
        clear_specific_cache "refresh_token:*" "refresh token"
        clear_specific_cache "user_refresh_tokens:*" "user token"
        ;;
    *)
        # Default: show cache info
        echo -e "${BLUE}Cache Statistics:${NC}"
        
        echo -e "\n${BLUE}Memory Usage:${NC}"
        redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" INFO memory | grep "used_memory_human\|used_memory_peak_human"
        
        echo -e "\n${BLUE}Total Keys:${NC}"
        redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" DBSIZE
        
        echo -e "\n${BLUE}Keys by Type:${NC}"
        echo -e "  User cache: $(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" KEYS "user:*" | wc -l)"
        echo -e "  Firm cache: $(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" KEYS "firm:*" | wc -l)"
        echo -e "  Token cache: $(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" KEYS "refresh_token:*" | wc -l)"
        
        echo -e "\nUse '$0 --help' for more options"
        ;;
esac
