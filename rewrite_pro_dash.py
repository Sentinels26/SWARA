import re
import os

home_file = "/Users/macbookair/Documents/swara1/frontend/src/pages/professional/Home.tsx"

with open(home_file, "r") as f:
    content = f.read()

# Replace the data fetching part
fetch_code = """
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    if (user && user.role === 'PROFESSIONAL') {
      api.get(`/api/dashboard/professional`).then(res => {
        setDashboardData(res.data);
      }).catch(err => console.error(err));
    }
  }, [user]);

  const activeCases = dashboardData?.activeCases || 0;
  const casesNeedingAttention = dashboardData?.casesNeedingAttention || 0;
  const todayAppointmentsCount = dashboardData?.todayAppointments || 0;
  const totalCases = dashboardData?.totalCasesHandled || 0;
  const recentAlerts = dashboardData?.recentAlerts || [];
  const upcomingAppointments = dashboardData?.upcomingAppointments || [];

  const priorityData = [
    { name: 'Critical', value: casesNeedingAttention, color: '#e11d48' },
    { name: 'High', value: Math.max(0, activeCases - casesNeedingAttention), color: '#f59e0b' },
    { name: 'Moderate', value: 0, color: '#3b82f6' },
    { name: 'Low', value: Math.max(0, totalCases - activeCases), color: '#10b981' },
  ];
"""

content = re.sub(r"const \[checkins, setCheckins\].*?const totalCases = priorityData\.reduce\(\(sum, item\) => sum \+ item\.value, 0\);", fetch_code, content, flags=re.DOTALL)

# Now fix the JSX to use dashboardData
content = content.replace("{checkins.length || 24}", "{activeCases}")
content = content.replace("↑ 2 new", "") # remove mock
content = content.replace("{priorityCounts['HIGH PRIORITY'] || 5}", "{casesNeedingAttention}")
content = content.replace("{appointments.length || 8}", "{todayAppointmentsCount}")
content = content.replace("{priorityCounts['HIGH PRIORITY'] > 0", "{casesNeedingAttention > 0")

alerts_template = """
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {recentAlerts.length > 0 ? recentAlerts.map((alert: any) => (
                          <div key={alert.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"><AlertCircle className="w-5 h-5"/></div>
                                  <div>
                                      <div className="text-sm font-bold text-slate-800">{alert.message}</div>
                                      <div className="text-xs text-slate-500">{new Date(alert.timestamp).toLocaleDateString()}</div>
                                  </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-slate-300" />
                          </div>
                        )) : (
                          <div className="text-sm text-slate-500">No recent alerts</div>
                        )}
                    </div>
"""
content = re.sub(r'<div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">.*?</div>\n                </div>', alerts_template + '\n                </div>', content, flags=re.DOTALL)


appts_template = """
                    <div className="space-y-3">
                        {upcomingAppointments.length > 0 ? upcomingAppointments.map((appt: any) => (
                          <div key={appt.id} className="flex items-center justify-between p-3 rounded-lg bg-[#f8fcfc]">
                              <div className="flex items-center gap-4">
                                  <div className="text-sm font-bold text-slate-500 w-16 text-right">{new Date(appt.scheduled_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                  <div className="text-sm font-bold text-[#2c757c] bg-[#e8f4f6] px-4 py-2 rounded-full shadow-sm">{appt.title}</div>
                              </div>
                              <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                                  <span className="hidden sm:inline">{appt.type}</span>
                                  <ChevronRight className="w-5 h-5 text-slate-400" />
                              </div>
                          </div>
                        )) : (
                          <div className="text-sm text-slate-500">No upcoming appointments</div>
                        )}
                    </div>
"""
content = re.sub(r'<div className="space-y-3">.*?</div>\n                </div>\n\n                {/\* Quick Actions \*/}', appts_template + '\n                </div>\n\n                {/* Quick Actions */}', content, flags=re.DOTALL)

with open(home_file, "w") as f:
    f.write(content)

print("Home.tsx rewritten")
