import { Card, CardContent, CardHeader, CardTitle } from "@/app/[locale]/components/ui/card";
import { Mail, CheckCircle2, XCircle, Clock, Globe, Tag } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/[locale]/components/ui/table";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { getAllNewsletterSubscribers, getNewsletterStats } from "@/actions/admin/newsletter";

export default async function NewsletterAdminPage() {
  const [subscribers, stats] = await Promise.all([
    getAllNewsletterSubscribers(),
    getNewsletterStats(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Newsletter Subscribers</h1>
        <p className="text-muted-foreground">Manage and view newsletter subscriptions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground">Active subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Not confirmed yet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.unsubscribed}</div>
            <p className="text-xs text-muted-foreground">Opted out</p>
          </CardContent>
        </Card>
      </div>

      {/* Source & Locale Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              By Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.sourceBreakdown).map(([source, count]) => (
                <div key={source} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{source}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              By Language
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.localeBreakdown).map(([locale, count]) => (
                <div key={locale} className="flex justify-between items-center">
                  <span className="text-sm uppercase">{locale}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscribers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscribers</CardTitle>
        </CardHeader>
        <CardContent>
          {subscribers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No subscribers found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead>Confirmed</TableHead>
                  <TableHead>Unsubscribed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((subscriber) => {
                  const isConfirmed = subscriber.confirmed_at && !subscriber.unsubscribed_at;
                  const isUnsubscribed = !!subscriber.unsubscribed_at;
                  const isPending = !subscriber.confirmed_at && !subscriber.unsubscribed_at;

                  return (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.email}</TableCell>
                      <TableCell>
                        {isConfirmed && (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Confirmed
                          </Badge>
                        )}
                        {isPending && (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                        {isUnsubscribed && (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Unsubscribed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm capitalize text-muted-foreground">
                          {subscriber.source || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm uppercase text-muted-foreground">
                          {subscriber.locale || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {subscriber.subscribed_at
                          ? new Date(subscriber.subscribed_at).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {subscriber.confirmed_at
                          ? new Date(subscriber.confirmed_at).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {subscriber.unsubscribed_at
                          ? new Date(subscriber.unsubscribed_at).toLocaleString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
