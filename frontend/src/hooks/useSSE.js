import { useState, useEffect, useCallback } from 'react';

export default function useSSE() {
  const [events, setEvents] = useState([]);
  const [finalCode, setFinalCode] = useState('');
  const [auditSummary, setAuditSummary] = useState('');
  const [appliedGuidelines, setAppliedGuidelines] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, running, complete, error
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    setStatus('running');
    setEvents([]);
    setFinalCode('');
    setAuditSummary('');
    setAppliedGuidelines([]);

    const eventSource = new EventSource(`/api/stream/${sessionId}`);

    const handleEvent = (e) => {
      try {
        const payload = JSON.parse(e.data);
        
        // Append event log
        setEvents((prev) => [
          ...prev,
          {
            event: e.type,
            data: payload,
            timestamp: parseFloat(e.lastEventId) || Date.now() / 1000
          }
        ]);

        if (e.type === 'pipeline_complete') {
          setFinalCode(payload.final_code || '');
          setAuditSummary(payload.audit_summary || '');
          setAppliedGuidelines(payload.applied_guidelines || []);
          setStatus('complete');
          eventSource.close();
        } else if (e.type === 'error') {
          setStatus('error');
          eventSource.close();
        }
      } catch (err) {
        console.error('Error parsing SSE event data:', err);
      }
    };

    // Listen to all pipeline events
    const eventTypes = [
      'session_start',
      'iteration_start',
      'architect_working',
      'architect_thinking',
      'rag_working',
      'rag_retrieved',
      'auditor_working',
      'auditor_thinking',
      'approved',
      'rejected',
      'synthesizer_working',
      'pipeline_complete',
      'error'
    ];

    eventTypes.forEach((type) => {
      eventSource.addEventListener(type, handleEvent);
    });

    eventSource.onerror = (err) => {
      console.error('EventSource connection failed:', err);
      setStatus('error');
      setEvents((prev) => [
        ...prev,
        {
          event: 'error',
          data: { message: 'Lost connection to SSE stream.' },
          timestamp: Date.now() / 1000
        }
      ]);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      console.log('SSE connection closed.');
    };
  }, [sessionId]);

  const triggerStream = useCallback((id) => {
    setSessionId(id);
  }, []);

  const resetStream = useCallback(() => {
    setSessionId(null);
    setStatus('idle');
    setEvents([]);
    setFinalCode('');
    setAuditSummary('');
    setAppliedGuidelines([]);
  }, []);

  return {
    events,
    finalCode,
    auditSummary,
    appliedGuidelines,
    status,
    triggerStream,
    resetStream
  };
}
