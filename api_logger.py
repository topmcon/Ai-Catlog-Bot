"""
API Call Tracking and Logging System
Tracks all API calls with request/response data, timing, and results
"""

import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any
import hashlib

class APILogger:
    """Tracks all API calls to a SQLite database"""
    
    def __init__(self, db_path: str = "logs/api_calls.db"):
        self.db_path = db_path
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        self._init_db()
    
    def _init_db(self):
        """Initialize database schema"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Main API calls table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS api_calls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                endpoint TEXT NOT NULL,
                method TEXT NOT NULL,
                client_ip TEXT,
                api_key_hash TEXT,
                
                -- Request data
                request_body TEXT,
                request_headers TEXT,
                model_number TEXT,
                search_query TEXT,
                
                -- Response data
                status_code INTEGER,
                success BOOLEAN,
                error_message TEXT,
                response_data TEXT,
                
                -- Performance
                response_time_ms INTEGER,
                credits_used INTEGER,
                
                -- Results
                results_count INTEGER,
                matched_model TEXT,
                match_type TEXT,
                
                -- Salesforce specific
                salesforce_record_id TEXT,
                salesforce_user TEXT,
                
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create indexes for common queries
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_timestamp ON api_calls(timestamp)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_endpoint ON api_calls(endpoint)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_model_number ON api_calls(model_number)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_success ON api_calls(success)")
        
        conn.commit()
        conn.close()
    
    def log_call(self, 
                 endpoint: str,
                 method: str,
                 request_data: Dict[Any, Any],
                 response_data: Dict[Any, Any],
                 response_time_ms: int,
                 status_code: int = 200,
                 client_ip: Optional[str] = None,
                 api_key: Optional[str] = None) -> int:
        """
        Log an API call
        Returns the log ID
        """
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Extract common fields
        model_number = None
        search_query = None
        if isinstance(request_data, dict):
            model_number = request_data.get('model_number') or request_data.get('model')
            search_query = request_data.get('search') or request_data.get('query')
        
        success = response_data.get('success', status_code == 200)
        error_message = response_data.get('error')
        results_count = None
        matched_model = None
        match_type = None
        credits_used = response_data.get('credits_used')
        
        # Extract Ferguson-specific fields
        if 'products' in response_data:
            results_count = len(response_data.get('products', []))
        if 'matched_model' in response_data:
            matched_model = response_data.get('matched_model')
            match_type = response_data.get('match_type')
        
        # Hash API key for security
        api_key_hash = None
        if api_key:
            api_key_hash = hashlib.sha256(api_key.encode()).hexdigest()[:16]
        
        cursor.execute("""
            INSERT INTO api_calls (
                timestamp, endpoint, method, client_ip, api_key_hash,
                request_body, status_code, success, error_message,
                response_data, response_time_ms, credits_used,
                model_number, search_query, results_count,
                matched_model, match_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            datetime.utcnow().isoformat(),
            endpoint,
            method,
            client_ip,
            api_key_hash,
            json.dumps(request_data),
            status_code,
            success,
            error_message,
            json.dumps(response_data) if len(json.dumps(response_data)) < 50000 else json.dumps({"truncated": True, "success": success}),
            response_time_ms,
            credits_used,
            model_number,
            search_query,
            results_count,
            matched_model,
            match_type
        ))
        
        log_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return log_id
    
    def get_recent_calls(self, limit: int = 100, endpoint: Optional[str] = None) -> list:
        """Get recent API calls"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        query = "SELECT * FROM api_calls"
        params = []
        
        if endpoint:
            query += " WHERE endpoint = ?"
            params.append(endpoint)
        
        query += " ORDER BY timestamp DESC LIMIT ?"
        params.append(limit)
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]
    
    def get_stats(self, hours: int = 24) -> Dict[str, Any]:
        """Get statistics for the last N hours"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        since = datetime.utcnow().replace(hour=datetime.utcnow().hour - hours).isoformat()
        
        # Total calls
        cursor.execute("SELECT COUNT(*) FROM api_calls WHERE timestamp > ?", (since,))
        total_calls = cursor.fetchone()[0]
        
        # Success rate
        cursor.execute("SELECT COUNT(*) FROM api_calls WHERE timestamp > ? AND success = 1", (since,))
        successful_calls = cursor.fetchone()[0]
        
        # By endpoint
        cursor.execute("""
            SELECT endpoint, COUNT(*) as count, AVG(response_time_ms) as avg_time
            FROM api_calls 
            WHERE timestamp > ?
            GROUP BY endpoint
            ORDER BY count DESC
        """, (since,))
        by_endpoint = [{"endpoint": row[0], "count": row[1], "avg_time_ms": round(row[2] or 0)} 
                      for row in cursor.fetchall()]
        
        # Failed calls
        cursor.execute("""
            SELECT endpoint, model_number, error_message, timestamp
            FROM api_calls 
            WHERE timestamp > ? AND success = 0
            ORDER BY timestamp DESC
            LIMIT 10
        """, (since,))
        recent_failures = [{"endpoint": row[0], "model": row[1], "error": row[2], "time": row[3]} 
                          for row in cursor.fetchall()]
        
        conn.close()
        
        return {
            "period_hours": hours,
            "total_calls": total_calls,
            "successful_calls": successful_calls,
            "failed_calls": total_calls - successful_calls,
            "success_rate": round(successful_calls / total_calls * 100, 2) if total_calls > 0 else 0,
            "by_endpoint": by_endpoint,
            "recent_failures": recent_failures
        }
    
    def search_calls(self, model_number: Optional[str] = None, 
                    endpoint: Optional[str] = None,
                    success: Optional[bool] = None,
                    limit: int = 50) -> list:
        """Search API call logs"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        query = "SELECT * FROM api_calls WHERE 1=1"
        params = []
        
        if model_number:
            query += " AND model_number LIKE ?"
            params.append(f"%{model_number}%")
        
        if endpoint:
            query += " AND endpoint = ?"
            params.append(endpoint)
        
        if success is not None:
            query += " AND success = ?"
            params.append(1 if success else 0)
        
        query += " ORDER BY timestamp DESC LIMIT ?"
        params.append(limit)
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]

# Global logger instance
logger = APILogger()
