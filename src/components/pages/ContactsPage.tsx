"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  User,
  Building2,
  Globe,
  ExternalLink,
  Download,
  RefreshCw,
  Filter,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";
import { toast } from "sonner";

interface Contact {
  id: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  author_name?: string;
  company_name?: string;
  source_url: string;
  domain: string;
  brand?: string;
  query?: string;
  confidence_score: number;
  extracted_at: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [userEmail, setUserEmail] = useState<string>("");

  // Fetch user session
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    fetchUser();
  }, []);

  // Fetch contacts
  useEffect(() => {
    if (userEmail) {
      fetchContacts();
    }
  }, [userEmail]);

  const fetchContacts = async () => {
    if (!userEmail) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("extracted_contacts")
        .select("*")
        .eq("user_email", userEmail)
        .order("extracted_at", { ascending: false });

      if (error) throw error;

      setContacts(data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleExtractContacts = async () => {
    if (!userEmail) {
      toast.error("Please sign in to extract contacts");
      return;
    }

    setExtracting(true);
    try {
      const response = await fetch("/api/contacts/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: userEmail,
          limit: 20, // Process first 20 URLs
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to extract contacts");
      }

      toast.success(
        `Successfully extracted ${result.contacts_found} contacts from ${result.processed} URLs`
      );

      // Refresh contacts list
      await fetchContacts();
    } catch (error) {
      console.error("Error extracting contacts:", error);
      toast.error(error instanceof Error ? error.message : "Failed to extract contacts");
    } finally {
      setExtracting(false);
    }
  };

  // Get unique brands and domains for filters
  const brands = React.useMemo(() => {
    const brandSet = new Set<string>();
    contacts.forEach(contact => {
      if (contact.brand) brandSet.add(contact.brand);
    });
    return Array.from(brandSet).sort();
  }, [contacts]);

  const domains = React.useMemo(() => {
    const domainSet = new Set<string>();
    contacts.forEach(contact => {
      if (contact.domain) domainSet.add(contact.domain);
    });
    return Array.from(domainSet).sort();
  }, [contacts]);

  // Filter + de-duplicate contacts (by email|phone|domain)
  const filteredContacts = React.useMemo(() => {
    const seen = new Set<string>();
    const out: Contact[] = [];

    const isJunkEmail = (email?: string) => {
      if (!email) return false;
      const e = email.toLowerCase();
      if (e === 'xxx@xxx.xxx') return true;
      if (/\.(png|jpg|jpeg|svg|gif)@/i.test(e) || /@.*\.(png|jpg|jpeg|svg|gif)$/i.test(e)) return true;
      const blocked = ['sentry.io','sentry.wixpress.com','sentry-next.wixpress.com','wixpress.com'];
      const domain = e.split('@')[1] || '';
      if (blocked.some(d => domain.endsWith(d))) return true;
      return false;
    };

    contacts.forEach(contact => {
      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          contact.email?.toLowerCase().includes(q) ||
          contact.phone?.includes(q) ||
          contact.company_name?.toLowerCase().includes(q) ||
          contact.domain?.toLowerCase().includes(q);
        if (!matches) return;
      }

      // Brand filter
      if (selectedBrand !== "all" && contact.brand !== selectedBrand) return;

      // Domain filter
      if (selectedDomain !== "all" && contact.domain !== selectedDomain) return;

      // Drop obvious junk emails
      if (isJunkEmail(contact.email)) return;

      const key = `${contact.email || ''}|${contact.phone || ''}|${contact.domain || ''}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push(contact);
    });

    return out;
  }, [contacts, searchQuery, selectedBrand, selectedDomain]);

  // Statistics
  const stats = React.useMemo(() => {
    return {
      total: contacts.length,
      withEmail: contacts.filter(c => c.email).length,
      withPhone: contacts.filter(c => c.phone).length,
      withSocial: contacts.filter(c => c.linkedin_url || c.twitter_url || c.facebook_url || c.instagram_url).length,
      avgConfidence: contacts.length > 0 
        ? Math.round(contacts.reduce((sum, c) => sum + c.confidence_score, 0) / contacts.length)
        : 0,
    };
  }, [contacts]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Email", "Phone", "Company", "LinkedIn", "Twitter", "Facebook", "Instagram", "Source URL", "Domain", "Brand", "Confidence", "Extracted At"];
    const rows = filteredContacts.map(contact => [
      contact.email || "",
      contact.phone || "",
      contact.company_name || "",
      contact.linkedin_url || "",
      contact.twitter_url || "",
      contact.facebook_url || "",
      contact.instagram_url || "",
      contact.source_url,
      contact.domain,
      contact.brand || "",
      contact.confidence_score.toString(),
      new Date(contact.extracted_at).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `contacts_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Contacts exported to CSV");
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Extracted Contacts</h1>
          <p className="text-muted-foreground mt-1">
            Contacts discovered from cited sources in your brand mentions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchContacts}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleExtractContacts}
            disabled={extracting || !userEmail}
          >
            {extracting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Extract Contacts
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Disclaimer - Beta phase */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="py-3 text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          <div className="text-sm">
            Contacts extraction is currently in <span className="font-medium">beta</span>. Results may include occasional false positives; please verify before outreach.
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Email</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withEmail}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.withEmail / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Phone</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withPhone}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.withPhone / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Social</CardTitle>
            <Linkedin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withSocial}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.withSocial / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgConfidence}%</div>
            <p className="text-xs text-muted-foreground">
              Quality score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter contacts by brand, domain, or search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, company, domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                {domains.map(domain => (
                  <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={filteredContacts.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contacts</CardTitle>
              <CardDescription>
                {filteredContacts.length} {filteredContacts.length === 1 ? 'contact' : 'contacts'}
                {searchQuery || selectedBrand !== "all" || selectedDomain !== "all" 
                  ? ` (filtered from ${contacts.length} total)`
                  : ''}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Mail className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-medium">No contacts found</p>
              <p className="text-sm mt-1">
                {contacts.length === 0
                  ? "Click 'Extract Contacts' to discover contacts from your source URLs"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Social Links</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead className="text-right">Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <div className="space-y-1">
                          {contact.author_name && (
                            <div className="font-medium flex items-center gap-2">
                              <User className="w-3 h-3" />
                              {contact.author_name}
                            </div>
                          )}
                          {contact.email && (
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Mail className="w-3 h-3" />
                              <a href={`mailto:${contact.email}`} className="hover:underline">
                                {contact.email}
                              </a>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              <a href={`tel:${contact.phone}`} className="hover:underline">
                                {contact.phone}
                              </a>
                            </div>
                          )}
                          {!contact.email && !contact.phone && !contact.company_name && (
                            <span className="text-sm text-muted-foreground">No contact info</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {contact.company_name ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3 h-3 text-muted-foreground" />
                            {contact.company_name}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 flex-wrap">
                          {contact.linkedin_url && (
                            <a
                              href={contact.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}
                          {contact.twitter_url && (
                            <a
                              href={contact.twitter_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-500 hover:underline"
                            >
                              <Twitter className="w-4 h-4" />
                            </a>
                          )}
                          {contact.facebook_url && (
                            <a
                              href={contact.facebook_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 hover:underline"
                            >
                              <Facebook className="w-4 h-4" />
                            </a>
                          )}
                          {contact.instagram_url && (
                            <a
                              href={contact.instagram_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-pink-600 hover:underline"
                            >
                              <Instagram className="w-4 h-4" />
                            </a>
                          )}
                          {!contact.linkedin_url && !contact.twitter_url && !contact.facebook_url && !contact.instagram_url && (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <a
                            href={contact.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Globe className="w-3 h-3" />
                            {contact.domain}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        {contact.brand ? (
                          <Badge variant="outline">{contact.brand}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Badge
                            variant={contact.confidence_score >= 70 ? "default" : contact.confidence_score >= 50 ? "secondary" : "outline"}
                          >
                            {contact.confidence_score}%
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

