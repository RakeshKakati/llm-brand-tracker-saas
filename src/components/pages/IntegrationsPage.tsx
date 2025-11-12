"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Link2,
  Plus,
  Trash2,
  Play,
  Pause,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Loader2,
  Copy,
  Settings,
  Clock,
  FileText,
  X,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";

interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'paused' | 'error';
  webhook_url?: string;
  last_triggered_at?: string;
  success_count?: number;
  error_count?: number;
  last_error?: string;
  event_filters?: any;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewingLogs, setViewingLogs] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    webhook_url: '',
    webhook_secret: '',
    webhook_auth_header: '',
    mentioned_only: false,
    min_position: '',
  });

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        console.log('No session found');
        return;
      }

      console.log('Fetching integrations for:', session.user.email);
      const response = await fetch(
        `/api/integrations?user_email=${encodeURIComponent(session.user.email)}`
      );
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error:', errorData);
        const errorMsg = errorData.error || response.statusText;
        setError(errorMsg);
        
        // Check if it's a migration issue
        if (errorData.details?.includes('does not exist') || 
            errorData.error?.includes('relation') || 
            errorData.error?.includes('does not exist')) {
          setError('Database migration not run. Please run supabase/migrations/add_integrations.sql in Supabase SQL Editor.');
        } else if (errorData.error === 'Unauthorized') {
          // This shouldn't happen now, but just in case
          setError('Authentication issue. Please refresh the page and try again.');
        }
        return;
      }

      const result = await response.json();
      console.log('Integrations fetched:', result);
      setIntegrations(result.integrations || []);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching integrations:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        alert('Please sign in');
        return;
      }

      const eventFilters: any = {};
      if (formData.mentioned_only) {
        eventFilters.mentioned_only = true;
      }
      if (formData.min_position) {
        eventFilters.min_position = parseInt(formData.min_position);
      }

      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: session.user.email,
          type: 'webhook',
          name: formData.name || 'Webhook Integration',
          webhook_url: formData.webhook_url,
          webhook_secret: formData.webhook_secret || null,
          webhook_auth_header: formData.webhook_auth_header || null,
          event_filters: Object.keys(eventFilters).length > 0 ? eventFilters : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.error || 'Failed to create integration';
        const details = errorData.details || errorData.hint || '';
        throw new Error(details ? `${errorMsg}\n\n${details}` : errorMsg);
      }

      const result = await response.json();
      console.log('Integration created:', result);
      alert('Integration created successfully!');
      setIsDialogOpen(false);
      setFormData({ name: '', webhook_url: '', webhook_secret: '', webhook_auth_header: '', mentioned_only: false, min_position: '' });
      // Refresh the list immediately
      await fetchIntegrations();
    } catch (error: any) {
      alert(error.message || 'Failed to create integration');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this integration?')) return;

    try {
      const response = await fetch(`/api/integrations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete integration');
      }

      alert('Integration deleted');
      fetchIntegrations();
    } catch (error) {
      alert('Failed to delete integration');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      const response = await fetch(`/api/integrations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update integration');
      }

      alert(`Integration ${newStatus === 'active' ? 'activated' : 'paused'}`);
      fetchIntegrations();
    } catch (error) {
      alert('Failed to update integration');
    }
  };

  const handleTest = async (id: string) => {
    try {
      setTesting(id);
      const response = await fetch(`/api/integrations/${id}/test`, {
        method: 'POST',
      });

      const result = await response.json();
      if (result.success) {
        alert(`✅ Test successful! Status: ${result.statusCode}\n\nCheck Make.com to see if the data arrived.`);
      } else {
        // Provide more helpful error message for 401
        let errorMsg = `Test failed: ${result.error}`;
        if (result.statusCode === 401) {
          errorMsg += '\n\n💡 Make.com webhooks usually DON\'T need authentication.';
          errorMsg += '\n\nCheck:\n';
          errorMsg += '1. Is the webhook URL correct? (copy it again from Make.com)\n';
          errorMsg += '2. Is the webhook still active in Make.com?\n';
          errorMsg += '3. Try creating a NEW webhook URL in Make.com\n';
          errorMsg += '4. If Make.com requires auth, add it in "Authorization Header" field';
        }
        alert(errorMsg);
      }
    } catch (error: any) {
      alert(`Test failed: ${error.message}`);
    } finally {
      setTesting(null);
    }
  };

  const copyWebhookUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('Webhook URL copied to clipboard');
  };

  const fetchLogs = async (integrationId: string) => {
    try {
      setLogsLoading(true);
      const response = await fetch(`/api/integrations/${integrationId}/logs?limit=50`);
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      const result = await response.json();
      setLogs(result.logs || []);
      setViewingLogs(integrationId);
    } catch (error: any) {
      alert(`Failed to load logs: ${error.message}`);
    } finally {
      setLogsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your brand mentions to external tools via webhooks
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">Setup Required</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">{error}</p>
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded text-xs text-red-800 dark:text-red-200">
                  <strong>Fix:</strong> Run the database migration in Supabase SQL Editor:
                  <br />
                  <code className="mt-1 block bg-red-50 dark:bg-red-900/50 p-2 rounded mt-2">
                    supabase/migrations/add_integrations.sql
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            About Webhooks
          </CardTitle>
          <CardDescription>
            Webhooks allow you to push brand mention data to any platform that accepts HTTP POST requests.
            Perfect for Make.com, Zapier, custom systems, and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>How it works:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
              <li>When a brand mention is found, we POST data to your webhook URL</li>
              <li>You can filter which mentions trigger the webhook</li>
              <li>All requests are logged for debugging</li>
              <li>Works with Make.com, Zapier, n8n, and any HTTP endpoint</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Integrations List */}
      {integrations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Link2 className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No integrations yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first webhook to start pushing brand mentions to external tools
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Webhook
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Active Integrations</CardTitle>
            <CardDescription>
              {integrations.length} integration{integrations.length !== 1 ? 's' : ''} configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Webhook URL</TableHead>
                  <TableHead>Last Triggered</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {integrations.map((integration) => (
                  <TableRow key={integration.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-muted-foreground" />
                        {integration.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          integration.status === 'active'
                            ? 'default'
                            : integration.status === 'error'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {integration.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {integration.status === 'error' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {integration.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 max-w-md">
                        <code className="text-xs bg-muted px-2 py-1 rounded truncate flex-1">
                          {integration.webhook_url || 'N/A'}
                        </code>
                        {integration.webhook_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyWebhookUrl(integration.webhook_url!)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {integration.last_triggered_at ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(integration.last_triggered_at).toLocaleString()}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-green-600">
                          ✓ {integration.success_count || 0} success
                        </div>
                        {integration.error_count > 0 && (
                          <div className="text-red-600">
                            ✗ {integration.error_count} errors
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchLogs(integration.id)}
                          title="View webhook logs"
                        >
                          <FileText className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTest(integration.id)}
                          disabled={testing === integration.id}
                          title="Test webhook"
                        >
                          {testing === integration.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(integration.id, integration.status)}
                          title={integration.status === 'active' ? 'Pause' : 'Activate'}
                        >
                          {integration.status === 'active' ? (
                            <Pause className="w-3 h-3" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(integration.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Webhook Integration</DialogTitle>
            <DialogDescription>
              Connect your brand mentions to Make.com, Zapier, or any HTTP endpoint
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Integration Name</Label>
              <Input
                id="name"
                placeholder="e.g., Make.com Webhook"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="webhook_url">Webhook URL *</Label>
              <Input
                id="webhook_url"
                type="url"
                placeholder="https://hook.make.com/your-webhook-url"
                value={formData.webhook_url}
                onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Must be HTTPS (or localhost for development)
              </p>
            </div>
            <div>
              <Label htmlFor="webhook_secret">Webhook Secret (Optional)</Label>
              <Input
                id="webhook_secret"
                type="password"
                placeholder="Secret for webhook signature"
                value={formData.webhook_secret}
                onChange={(e) => setFormData({ ...formData, webhook_secret: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used to verify webhook authenticity
              </p>
            </div>
            <div>
              <Label htmlFor="webhook_auth_header">Authorization Header (Optional)</Label>
              <Input
                id="webhook_auth_header"
                type="text"
                placeholder='Bearer token123 or Basic base64string'
                value={formData.webhook_auth_header}
                onChange={(e) => setFormData({ ...formData, webhook_auth_header: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                If your webhook requires authentication (e.g., Make.com with API key), add the Authorization header here.
                <br />
                Format: <code className="text-xs">Bearer your-token</code> or <code className="text-xs">Basic base64string</code>
                <br />
                <strong className="text-red-600 dark:text-red-400">If you get "HTTP 401: Unauthorized", add your auth token here!</strong>
              </p>
            </div>
            <div className="space-y-3 border-t pt-4">
              <Label>Filters (Optional)</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="mentioned_only"
                  checked={formData.mentioned_only}
                  onChange={(e) => setFormData({ ...formData, mentioned_only: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="mentioned_only" className="font-normal">
                  Only trigger when brand is mentioned
                </Label>
              </div>
              <div>
                <Label htmlFor="min_position">Minimum Position (Optional)</Label>
                <Input
                  id="min_position"
                  type="number"
                  placeholder="e.g., 3 (only trigger if position ≤ 3)"
                  value={formData.min_position}
                  onChange={(e) => setFormData({ ...formData, min_position: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.webhook_url}
            >
              Create Integration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logs Dialog */}
      <Dialog open={viewingLogs !== null} onOpenChange={(open) => !open && setViewingLogs(null)}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Webhook Logs</DialogTitle>
            <DialogDescription>
              Detailed logs of all webhook attempts, requests, and responses
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {logsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No logs yet</p>
                <p className="text-sm mt-2">Logs will appear here when webhooks are triggered</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <Card key={log.id} className={`border-l-4 ${
                    log.status === 'success' 
                      ? 'border-l-green-500 bg-green-50/50 dark:bg-green-950/10' 
                      : log.status === 'error'
                      ? 'border-l-red-500 bg-red-50/50 dark:bg-red-950/10'
                      : 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/10'
                  }`}>
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              <Badge variant={log.status === 'success' ? 'default' : log.status === 'error' ? 'destructive' : 'secondary'} className="text-xs">
                                {log.status.toUpperCase()}
                              </Badge>
                              {log.status_code && (
                                <Badge variant="outline" className="text-xs">
                                  HTTP {log.status_code}
                                </Badge>
                              )}
                              {log.duration_ms && (
                                <Badge variant="outline" className="text-xs">
                                  {log.duration_ms}ms
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {new Date(log.created_at).toLocaleString()}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <span className="text-xs font-semibold text-muted-foreground">Event Type:</span>
                                <p className="text-sm font-medium">{log.event_type}</p>
                              </div>
                              {log.error_message && (
                                <div>
                                  <span className="text-xs font-semibold text-muted-foreground">Error:</span>
                                  <p className="text-sm text-red-600 dark:text-red-400 mt-1 bg-red-100 dark:bg-red-900/20 p-2 rounded">
                                    {log.error_message}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Request Payload */}
                        {log.request_payload && (
                          <details className="group">
                            <summary className="cursor-pointer text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center gap-2">
                              <span>Request Payload</span>
                              <span className="text-xs">(Click to expand)</span>
                            </summary>
                            <div className="mt-2 p-3 bg-muted rounded-lg">
                              <pre className="text-xs overflow-auto max-h-64">
                                {JSON.stringify(log.request_payload, null, 2)}
                              </pre>
                            </div>
                          </details>
                        )}

                        {/* Response Body */}
                        {log.response_body && (
                          <details className="group">
                            <summary className="cursor-pointer text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center gap-2">
                              <span>Response Body</span>
                              <Badge variant="outline" className="text-xs">
                                {log.response_body.length} chars
                              </Badge>
                            </summary>
                            <div className="mt-2 p-3 bg-muted rounded-lg">
                              <pre className="text-xs overflow-auto max-h-64 whitespace-pre-wrap break-words">
                                {log.response_body}
                              </pre>
                            </div>
                          </details>
                        )}

                        {/* Raw Log Data */}
                        <details className="group">
                          <summary className="cursor-pointer text-xs font-semibold text-muted-foreground hover:text-foreground">
                            Raw Log Data (JSON)
                          </summary>
                          <div className="mt-2 p-3 bg-muted rounded-lg">
                            <pre className="text-xs overflow-auto max-h-48">
                              {JSON.stringify({
                                id: log.id,
                                integration_id: log.integration_id,
                                event_type: log.event_type,
                                status: log.status,
                                status_code: log.status_code,
                                duration_ms: log.duration_ms,
                                created_at: log.created_at,
                                error_message: log.error_message,
                              }, null, 2)}
                            </pre>
                          </div>
                        </details>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="border-t pt-4">
            {viewingLogs && (
              <Button 
                variant="outline" 
                onClick={() => fetchLogs(viewingLogs)} 
                disabled={logsLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${logsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
            <Button variant="default" onClick={() => {
              setViewingLogs(null);
              setLogs([]);
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

