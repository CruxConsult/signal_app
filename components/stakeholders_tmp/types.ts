export type Stakeholder = {
    id: number;
    name: string;
    role: string;
    status: string;
    summary?: string | null;
    manual_status?: string | null;
  
    ai_sentiment?: string | null;
    ai_summary?: string | null;
    ai_what_changed?: string | null;
    ai_suggested_approach?: string | null;
    ai_key_signals?: string | null;
  
    ai_stakeholder_sentiment?: string | null;
    ai_personal_sentiment?: string | null;
    ai_relationship_strength?: string | null;
    ai_evidence_strength?: string | null;
    ai_sentiment_confidence?: number | null;
    ai_sentiment_rationale?: string | null;
  
    ai_supporting_signals?: string | null;
    ai_counter_signals?: string | null;
    ai_uncertainties?: string | null;
  
    created_at?: string | null;
    user_id?: string | null;
  };
  
  export type Interaction = {
    id: number;
    stakeholder_id: number;
    user_id: string;
    interaction_date: string;
    source_type: string;
    title?: string | null;
    content: string;
    created_at?: string | null;
  };
  
  export type Insight = {
    stakeholder_sentiment: string;
    personal_sentiment: string;
    relationship_strength: string;
    evidence_strength: string;
    confidence: number;
    summary: string;
    what_changed: string;
    suggested_approach: string;
    rationale: string;
    supporting_signals: string[];
    counter_signals: string[];
    uncertainties: string[];
    key_signals: string[];
  };
  
  export type SentimentHistoryRow = {
    id: number;
    stakeholder_id: number;
    user_id: string;
    stakeholder_sentiment?: string | null;
    personal_sentiment?: string | null;
    relationship_strength?: string | null;
    evidence_strength?: string | null;
    confidence?: number | null;
    rationale?: string | null;
    supporting_signals?: string | null;
    counter_signals?: string | null;
    uncertainties?: string | null;
    created_at: string;
  };