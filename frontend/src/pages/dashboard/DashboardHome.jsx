import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import {
  Box, SimpleGrid, Text, Flex, Icon, Spinner,
  Badge, Button, Avatar, Grid, Divider,
} from "@chakra-ui/react";
import {
  FaUsers, FaCalendarCheck, FaClipboardList, FaMoneyBillWave,
  FaChartLine, FaUserTie, FaArrowUp, FaChevronRight,
  FaBell, FaExclamationTriangle, FaClock, FaCheckCircle,
  FaUserCheck, FaUserTimes, FaSearch,
} from "react-icons/fa";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTip, ResponsiveContainer, Legend,
  AreaChart, Area,
} from "recharts";

/* ── helpers ── */
const MTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const greet = () => { const h=new Date().getHours(); return h<12?"Good Morning":h<17?"Good Afternoon":"Good Evening"; };
const Rs    = (n) => n>=1e6?`Rs ${(n/1e6).toFixed(1)}M`:n>=1e3?`Rs ${(n/1e3).toFixed(0)}K`:`Rs ${n||0}`;
const useClock = () => {
  const [t,setT]=useState(new Date());
  useEffect(()=>{const id=setInterval(()=>setT(new Date()),1000);return()=>clearInterval(id);},[]);
  return t.toLocaleTimeString("en-PK",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
};

/* ── gradient presets (like the screenshot) ── */
const GRAD = {
  green:  { from:"#34d399", to:"#059669", badge:"#ecfdf5", badgeTxt:"#065f46" },
  yellow: { from:"#fbbf24", to:"#d97706", badge:"#fffbeb", badgeTxt:"#92400e" },
  red:    { from:"#f87171", to:"#dc2626", badge:"#fef2f2", badgeTxt:"#991b1b" },
  blue:   { from:"#60a5fa", to:"#1d4ed8", badge:"#eff6ff", badgeTxt:"#1e3a8a" },
};

/* ══════════════════════════════════════════
   GRADIENT KPI CARD  (screenshot style)
══════════════════════════════════════════ */
const KpiCard = ({ label, value, sub, icon, grad, to }) => {
  const nav = useNavigate();
  const g   = GRAD[grad];
  return (
    <Box
      bgGradient={`linear(135deg, ${g.from}, ${g.to})`}
      borderRadius="2xl" p={4} color="white" position="relative" overflow="hidden"
      cursor={to?"pointer":"default"} onClick={()=>to&&nav(to)}
      boxShadow={`0 8px 24px ${g.to}55`}
      _hover={to?{transform:"translateY(-2px)",boxShadow:`0 12px 30px ${g.to}66`}:{}}
      transition="all 0.2s"
    >
      {/* decorative circle */}
      <Box position="absolute" top="-18px" right="-18px" w="80px" h="80px"
        borderRadius="full" bg="whiteAlpha.200" />
      <Box position="absolute" bottom="-12px" right="30px" w="45px" h="45px"
        borderRadius="full" bg="whiteAlpha.150" />

      <Flex justify="space-between" align="flex-start">
        <Box>
          <Text fontSize="11px" fontWeight="600" opacity={0.85} textTransform="uppercase" letterSpacing="0.08em">{label}</Text>
          <Text fontSize="2xl" fontWeight="800" mt={0.5} lineHeight={1}>{value}</Text>
        </Box>
        {/* circular icon badge */}
        <Flex w={9} h={9} borderRadius="full" bg="whiteAlpha.300" align="center" justify="center" flexShrink={0}>
          <Icon as={icon} boxSize={4} />
        </Flex>
      </Flex>

      <Flex align="center" gap={1.5} mt={2.5}>
        <Flex align="center" gap={1} bg="whiteAlpha.300" borderRadius="full" px={2} py={0.5}>
          <Icon as={FaArrowUp} boxSize={2.5} />
          <Text fontSize="10px" fontWeight="700">+74% Inc.</Text>
        </Flex>
        {sub && <Text fontSize="10px" opacity={0.75}>{sub}</Text>}
      </Flex>
    </Box>
  );
};

/* ── compact card wrapper ── */
const Panel = ({ title, action, onAction, children, ...rest }) => (
  <Flex direction="column" bg="white" borderRadius="2xl"
    boxShadow="0 1px 4px rgba(0,0,0,0.06)" border="1px solid" borderColor="gray.100"
    overflow="hidden" {...rest}>
    {title && (
      <Flex px={4} pt={3.5} pb={2} justify="space-between" align="center" flexShrink={0}>
        <Text fontWeight="700" fontSize="sm" color="gray.800">{title}</Text>
        {action && (
          <Button size="xs" variant="ghost" colorScheme="gray" borderRadius="lg"
            onClick={onAction} rightIcon={<Icon as={FaChevronRight} boxSize={2}/>}
            fontSize="10px" px={2} h={5} color="gray.400">{action}</Button>
        )}
      </Flex>
    )}
    {children}
  </Flex>
);

/* ── flex chart container (recharts fix) ── */
const FlexChart = ({ children }) => (
  <Box flex={1} minH={0} px={3} pb={3}>
    <Box h="100%" position="relative">
      <Box position="absolute" top={0} left={0} right={0} bottom={0}>{children}</Box>
    </Box>
  </Box>
);

/* ── leave type icon colors ── */
const LEAVE_CFG = {
  "Sick Leave":      { color:"#ef4444", bg:"#fef2f2" },
  "Annual Leave":    { color:"#3b82f6", bg:"#eff6ff" },
  "Emergency Leave": { color:"#f59e0b", bg:"#fffbeb" },
  "Unpaid Leave":    { color:"#8b5cf6", bg:"#faf5ff" },
  "Maternity Leave": { color:"#ec4899", bg:"#fdf2f8" },
  "No Data":         { color:"#9ca3af", bg:"#f9fafb" },
};
const leaveCfg = (name) => LEAVE_CFG[name] || { color:"#6366f1", bg:"#eef2ff" };

/* ══════════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════════ */
const AdminDashboard = ({ data }) => {
  const { user }   = useContext(AuthContext);
  const nav        = useNavigate();
  const clock      = useClock();
  const firstName  = user?.name?.split(" ")[0] || "Admin";
  const curMonth   = new Date().toLocaleString("default",{month:"long",year:"numeric"});

  const total    = data.summary.totalEmployees  || 0;
  const pres     = data.summary.attendanceToday  || 0;
  const leaves   = data.summary.pendingLeaves    || 0;
  const payroll  = data.summary.monthlyPayroll   || 0;
  const absent   = Math.max(0, total - pres);
  const rate     = total ? Math.round((pres/total)*100) : 0;

  /* bar chart: daily attendance (grouped bars) */
  const barData = data.attendance.map(i=>({
    name: i._id.slice(5),
    Present: i.present,
    Absent:  i.absent,
  }));

  /* leave list */
  const leaveList = data.leaves.map(i=>({ name:i._id, value:i.total }));
  if (!leaveList.length) leaveList.push({ name:"No Data", value:0 });

  const presTotal = barData.reduce((s,i)=>s+(i.Present||0),0);
  const absTotal  = barData.reduce((s,i)=>s+(i.Absent||0),0);
  const leavTotal = data.leaves.reduce((s,l)=>s+l.total,0);

  /* activity feed items */
  const feed = [
    { icon:FaUserCheck,  color:"#059669", bg:"#f0fdf4", label:"Employees Present Today",    value:pres,          sub:`${rate}% attendance rate` },
    { icon:FaClipboardList,color:"#d97706",bg:"#fffbeb",label:"Leave Requests Pending",       value:leaves,        sub:"Awaiting your approval"   },
    { icon:FaMoneyBillWave,color:"#7c3aed",bg:"#faf5ff",label:"Monthly Payroll Disbursed",    value:Rs(payroll),   sub:`Net salary for ${curMonth}`},
    { icon:FaUserTimes,  color:"#dc2626", bg:"#fef2f2", label:"Absences This Month",          value:absTotal,      sub:"Total absent records"     },
  ];

  /* meetings-style: pending leaves list */
  const pendingColors = ["#059669","#3b82f6","#f59e0b","#8b5cf6","#ef4444"];

  return (
    <Flex direction="column" gap={3}
      mx={{ base:-4, md:-6 }} mt={{ base:-4, md:-6 }} mb={{ base:-4, md:-6 }}
      h="calc(100vh - 64px)" overflow="hidden" bg="#f4f6f9"
      px={5} pt={4} pb={3}>

      {/* ── TOP BAR ── */}
      <Flex justify="space-between" align="center" flexShrink={0}>
        <Box>
          <Text fontSize="xl" fontWeight="800" color="gray.800">Dashboard</Text>
          <Text fontSize="xs" color="gray.400">{greet()}, {firstName} · {curMonth}</Text>
        </Box>
        <Flex align="center" gap={3}>
          {/* live clock */}
          <Flex align="center" gap={2} px={3} py={1.5} bg="white" borderRadius="xl"
            boxShadow="0 1px 4px rgba(0,0,0,0.06)" border="1px solid" borderColor="gray.100">
            <Icon as={FaClock} color="gray.400" boxSize={3}/>
            <Text fontSize="xs" fontWeight="700" color="gray.700" letterSpacing="0.05em">{clock}</Text>
          </Flex>
          {/* status */}
          <Flex align="center" gap={1.5} px={3} py={1.5} bg="white" borderRadius="xl"
            boxShadow="0 1px 4px rgba(0,0,0,0.06)" border="1px solid" borderColor="gray.100">
            <Box w={2} h={2} borderRadius="full" bg="#4ade80" boxShadow="0 0 0 3px rgba(74,222,128,0.25)"/>
            <Text fontSize="xs" color="gray.500" fontWeight="500">Live</Text>
          </Flex>
          <Avatar name={user?.name} size="sm" bg="#059669" color="white" fontWeight="bold"/>
        </Flex>
      </Flex>

      {/* ── KPI CARDS (screenshot style: 4 gradient cards) ── */}
      <SimpleGrid columns={4} spacing={4} flexShrink={0}>
        <KpiCard label="Total Employees"  value={total}       sub="Active staff"    icon={FaUsers}         grad="green"  to="/dashboard/employees"/>
        <KpiCard label="Present Today"    value={pres}        sub={`of ${total}`}   icon={FaCalendarCheck} grad="yellow" to="/dashboard/attendance/daily"/>
        <KpiCard label="Pending Leaves"   value={leaves}      sub="Need approval"   icon={FaClipboardList} grad="red"    to="/dashboard/leaves"/>
        <KpiCard label="Monthly Payroll"  value={Rs(payroll)} sub="Net disbursed"   icon={FaMoneyBillWave} grad="blue"   to="/dashboard/payroll"/>
      </SimpleGrid>

      {/* ── MIDDLE ROW: Bar Chart + Leave List ── */}
      <Grid flex={1} minH={0} templateColumns="1fr 320px" gap={4}>

        {/* Bar chart — "Statistics" style */}
        <Panel title="Statistics of Attendance" action="Month ▾">
          {/* legend */}
          <Flex gap={4} px={4} pb={1} flexShrink={0}>
            <Flex align="center" gap={1.5}><Box w={3} h={3} borderRadius="sm" bg="#3b82f6"/><Text fontSize="xs" color="gray.500">Present</Text></Flex>
            <Flex align="center" gap={1.5}><Box w={3} h={3} borderRadius="sm" bg="#f87171"/><Text fontSize="xs" color="gray.500">Absent</Text></Flex>
          </Flex>
          <FlexChart>
            {barData.length===0
              ? <Flex h="100%" align="center" justify="center" color="gray.300" fontSize="sm">No attendance data yet</Flex>
              : <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{top:4,right:8,left:-20,bottom:0}} barGap={3} barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5"/>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:10,fill:"#9ca3af"}}/>
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize:10,fill:"#9ca3af"}}/>
                    <ReTip
                      contentStyle={{borderRadius:"12px",border:"none",boxShadow:"0 8px 30px rgba(0,0,0,0.12)",fontSize:"12px"}}
                      cursor={{fill:"rgba(0,0,0,0.03)"}}
                    />
                    <Bar dataKey="Present" fill="#3b82f6" radius={[4,4,0,0]}/>
                    <Bar dataKey="Absent"  fill="#f87171" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
            }
          </FlexChart>
        </Panel>

        {/* Recent Leave Requests / Leave Breakdown — "Recent Added Jobs" style */}
        <Panel title="Leave Breakdown" action="All Types" onAction={()=>nav("/dashboard/leaves")}>
          <Box px={3} pb={3} flex={1} overflowY="auto">
            {leaveList.map((item,i)=>{
              const cfg = leaveCfg(item.name);
              return (
                <Flex key={item.name} align="center" gap={3} px={3} py={2.5} mb={1.5}
                  bg="gray.50" borderRadius="xl" border="1px solid" borderColor="gray.100"
                  _hover={{ bg:"white", borderColor:"gray.200" }} transition="all 0.13s">
                  {/* logo-style icon */}
                  <Flex w={9} h={9} borderRadius="xl" bg={cfg.bg} align="center" justify="center" flexShrink={0}>
                    <Icon as={FaClipboardList} color={cfg.color} boxSize={3.5}/>
                  </Flex>
                  <Box flex={1} minW={0}>
                    <Text fontSize="xs" fontWeight="700" color="gray.800" noOfLines={1}>{item.name}</Text>
                    <Text fontSize="10px" color="gray.400">{item.value} request{item.value!==1?"s":""} this month</Text>
                  </Box>
                  <Badge bg={cfg.bg} color={cfg.color} borderRadius="full" fontSize="10px" px={2} py={0.5} fontWeight="700">
                    {item.value}
                  </Badge>
                </Flex>
              );
            })}
            {/* summary */}
            <Flex mt={2} px={3} py={2} bg="gray.50" borderRadius="xl" justify="space-between" align="center">
              <Text fontSize="xs" color="gray.500">Total Leave Requests</Text>
              <Text fontSize="sm" fontWeight="800" color="gray.800">{leavTotal}</Text>
            </Flex>
          </Box>
        </Panel>
      </Grid>

      {/* ── BOTTOM ROW: Activity Feed + Meetings ── */}
      <Grid flexShrink={0} templateColumns="1fr 1fr" gap={4} h="148px">

        {/* Activity Feed */}
        <Panel title="Activity Feed" action="All Activity ▾" onAction={()=>{}}>
          <Box px={3} pb={2} overflowY="hidden">
            {feed.slice(0,3).map((f,i)=>(
              <Flex key={i} align="center" gap={3} py={1.5}
                borderBottom={i<2?"1px solid":"none"} borderColor="gray.50">
                <Flex w={7} h={7} borderRadius="full" bg={f.bg} align="center" justify="center" flexShrink={0}>
                  <Icon as={f.icon} color={f.color} boxSize={3}/>
                </Flex>
                <Box flex={1} minW={0}>
                  <Text fontSize="xs" color="gray.700" fontWeight="600" noOfLines={1}>{f.label}</Text>
                  <Text fontSize="10px" color="gray.400">{f.sub}</Text>
                </Box>
                <Badge colorScheme="gray" borderRadius="full" fontSize="10px" fontWeight="700">{f.value}</Badge>
              </Flex>
            ))}
          </Box>
        </Panel>

        {/* Meetings / Schedule style — Today's Summary */}
        <Panel title="Today's Overview" action="Create New ▾">
          <Box px={3} pb={2}>
            {[
              { color:"#3b82f6", day:"Mon", date:new Date().getDate(), label:"Present Staff",      val:`${pres} employees`,   time:`${rate}% rate`        },
              { color:"#f59e0b", day:"Tue", date:new Date().getDate()+1, label:"Pending Approvals", val:`${leaves} leaves`,   time:"Awaiting review"      },
              { color:"#059669", day:"Wed", date:new Date().getDate()+2, label:"This Month Total",  val:`${presTotal} attend`, time:`${absTotal} absences` },
            ].map((m,i)=>(
              <Flex key={i} align="center" gap={3} py={1.5}
                borderBottom={i<2?"1px solid":"none"} borderColor="gray.50">
                {/* date badge */}
                <Flex direction="column" align="center" justify="center" w={9} h={9}
                  bg={m.color} borderRadius="xl" flexShrink={0}>
                  <Text fontSize="11px" fontWeight="800" color="white" lineHeight={1}>{m.day}</Text>
                  <Text fontSize="9px" color="whiteAlpha.800" lineHeight={1}>{m.date}</Text>
                </Flex>
                <Box flex={1} minW={0}>
                  <Text fontSize="xs" fontWeight="700" color="gray.800" noOfLines={1}>{m.label}</Text>
                  <Text fontSize="10px" color="gray.400">{m.time}</Text>
                </Box>
                <Text fontSize="xs" fontWeight="700" color="gray.600" flexShrink={0}>{m.val}</Text>
                <Icon as={FaChevronRight} boxSize={2.5} color="gray.300"/>
              </Flex>
            ))}
          </Box>
        </Panel>
      </Grid>
    </Flex>
  );
};

/* ══════════════════════════════════════════
   MANAGER DASHBOARD
══════════════════════════════════════════ */
const ManagerDashboard = ({ data }) => {
  const { user } = useContext(AuthContext);
  const nav      = useNavigate();
  const clock    = useClock();
  const name     = user?.name?.split(" ")[0] || "Manager";
  const curMonth = new Date().toLocaleString("default",{month:"long",year:"numeric"});

  const total  = data.summary.totalEmployees  || 0;
  const pres   = data.summary.attendanceToday  || 0;
  const leaves = data.summary.pendingLeaves    || 0;
  const absent = Math.max(0, total - pres);
  const rate   = total ? Math.round((pres/total)*100) : 0;

  const barData = data.attendance.map(i=>({
    name:i._id.slice(5), Present:i.present, Absent:i.absent,
  }));
  const leaveList = data.leaves.map(i=>({ name:i._id, value:i.total }));
  if (!leaveList.length) leaveList.push({ name:"No Data", value:0 });
  const leavTotal = data.leaves.reduce((s,l)=>s+l.total,0);
  const presTotal = barData.reduce((s,i)=>s+(i.Present||0),0);
  const absTotal  = barData.reduce((s,i)=>s+(i.Absent||0),0);

  const feed = [
    { icon:FaUserCheck,    color:"#059669", bg:"#f0fdf4", label:"Present Today",         value:pres,    sub:`${rate}% attendance` },
    { icon:FaClipboardList,color:"#d97706", bg:"#fffbeb", label:"Pending Leaves",         value:leaves,  sub:"Needs review"         },
    { icon:FaUserTimes,    color:"#dc2626", bg:"#fef2f2", label:"Not Marked Today",       value:absent,  sub:"Absent / unmarked"    },
  ];

  return (
    <Flex direction="column" gap={3}
      mx={{ base:-4, md:-6 }} mt={{ base:-4, md:-6 }} mb={{ base:-4, md:-6 }}
      h="calc(100vh - 64px)" overflow="hidden" bg="#f4f6f9"
      px={5} pt={4} pb={3}>

      {/* top bar */}
      <Flex justify="space-between" align="center" flexShrink={0}>
        <Box>
          <Text fontSize="xl" fontWeight="800" color="gray.800">Dashboard</Text>
          <Text fontSize="xs" color="gray.400">{greet()}, {name} · Manager View</Text>
        </Box>
        <Flex align="center" gap={3}>
          <Flex align="center" gap={2} px={3} py={1.5} bg="white" borderRadius="xl"
            boxShadow="0 1px 4px rgba(0,0,0,0.06)" border="1px solid" borderColor="gray.100">
            <Icon as={FaClock} color="gray.400" boxSize={3}/>
            <Text fontSize="xs" fontWeight="700" color="gray.700" letterSpacing="0.05em">{clock}</Text>
          </Flex>
          <Flex align="center" gap={1.5} px={3} py={1.5} bg="white" borderRadius="xl"
            boxShadow="0 1px 4px rgba(0,0,0,0.06)" border="1px solid" borderColor="gray.100">
            <Box w={2} h={2} borderRadius="full" bg="#4ade80" boxShadow="0 0 0 3px rgba(74,222,128,0.25)"/>
            <Text fontSize="xs" color="gray.500" fontWeight="500">Live</Text>
          </Flex>
          <Avatar name={user?.name} size="sm" bg="#059669" color="white" fontWeight="bold"/>
        </Flex>
      </Flex>

      {/* KPI cards */}
      <SimpleGrid columns={4} spacing={4} flexShrink={0}>
        <KpiCard label="Total Staff"     value={total}       sub="Active employees"   icon={FaUsers}         grad="green"  to="/dashboard/employees"/>
        <KpiCard label="Present Today"   value={pres}        sub={`${rate}% rate`}    icon={FaCalendarCheck} grad="yellow" to="/dashboard/attendance/daily"/>
        <KpiCard label="Pending Leaves"  value={leaves}      sub="Need approval"      icon={FaClipboardList} grad="red"    to="/dashboard/leaves"/>
        <KpiCard label="Attendance Rate" value={`${rate}%`}  sub="Today"              icon={FaChartLine}     grad="blue"/>
      </SimpleGrid>

      {/* middle: chart + leave list */}
      <Grid flex={1} minH={0} templateColumns="1fr 300px" gap={4}>
        <Panel title="Monthly Attendance Statistics" action="Month ▾">
          <Flex gap={4} px={4} pb={1} flexShrink={0}>
            <Flex align="center" gap={1.5}><Box w={3} h={3} borderRadius="sm" bg="#3b82f6"/><Text fontSize="xs" color="gray.500">Present ({presTotal})</Text></Flex>
            <Flex align="center" gap={1.5}><Box w={3} h={3} borderRadius="sm" bg="#f87171"/><Text fontSize="xs" color="gray.500">Absent ({absTotal})</Text></Flex>
          </Flex>
          <FlexChart>
            {barData.length===0
              ? <Flex h="100%" align="center" justify="center" color="gray.300" fontSize="sm">No data yet</Flex>
              : <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{top:4,right:8,left:-20,bottom:0}} barGap={3} barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5"/>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:10,fill:"#9ca3af"}}/>
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize:10,fill:"#9ca3af"}}/>
                    <ReTip contentStyle={{borderRadius:"12px",border:"none",boxShadow:"0 8px 30px rgba(0,0,0,0.12)",fontSize:"12px"}} cursor={{fill:"rgba(0,0,0,0.03)"}}/>
                    <Bar dataKey="Present" fill="#3b82f6" radius={[4,4,0,0]}/>
                    <Bar dataKey="Absent"  fill="#f87171" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
            }
          </FlexChart>
        </Panel>

        <Panel title="Leave Breakdown" action="View All" onAction={()=>nav("/dashboard/leaves")}>
          <Box px={3} pb={3} flex={1} overflowY="auto">
            {leaveList.map((item)=>{
              const cfg = leaveCfg(item.name);
              return (
                <Flex key={item.name} align="center" gap={3} px={3} py={2.5} mb={1.5}
                  bg="gray.50" borderRadius="xl" border="1px solid" borderColor="gray.100"
                  _hover={{ bg:"white", borderColor:"gray.200" }} transition="all 0.13s">
                  <Flex w={9} h={9} borderRadius="xl" bg={cfg.bg} align="center" justify="center" flexShrink={0}>
                    <Icon as={FaClipboardList} color={cfg.color} boxSize={3.5}/>
                  </Flex>
                  <Box flex={1} minW={0}>
                    <Text fontSize="xs" fontWeight="700" color="gray.800" noOfLines={1}>{item.name}</Text>
                    <Text fontSize="10px" color="gray.400">{item.value} requests this month</Text>
                  </Box>
                  <Badge bg={cfg.bg} color={cfg.color} borderRadius="full" fontSize="10px" px={2} fontWeight="700">{item.value}</Badge>
                </Flex>
              );
            })}
          </Box>
        </Panel>
      </Grid>

      {/* bottom: activity + overview */}
      <Grid flexShrink={0} templateColumns="1fr 1fr" gap={4} h="140px">
        <Panel title="Activity Feed" action="All Activity ▾">
          <Box px={3} pb={2}>
            {feed.map((f,i)=>(
              <Flex key={i} align="center" gap={3} py={1.5}
                borderBottom={i<feed.length-1?"1px solid":"none"} borderColor="gray.50">
                <Flex w={7} h={7} borderRadius="full" bg={f.bg} align="center" justify="center" flexShrink={0}>
                  <Icon as={f.icon} color={f.color} boxSize={3}/>
                </Flex>
                <Box flex={1} minW={0}>
                  <Text fontSize="xs" color="gray.700" fontWeight="600" noOfLines={1}>{f.label}</Text>
                  <Text fontSize="10px" color="gray.400">{f.sub}</Text>
                </Box>
                <Badge colorScheme="gray" borderRadius="full" fontSize="10px" fontWeight="700">{f.value}</Badge>
              </Flex>
            ))}
          </Box>
        </Panel>

        <Panel title="Today's Overview">
          <Box px={3} pb={2}>
            {[
              { color:"#3b82f6", day:"Mon", date:new Date().getDate(),   label:"Present Staff",     val:`${pres} employees`,  time:`${rate}% attendance`  },
              { color:"#f59e0b", day:"Tue", date:new Date().getDate()+1, label:"Pending Leaves",    val:`${leaves} requests`, time:"Awaiting review"      },
              { color:"#059669", day:"Wed", date:new Date().getDate()+2, label:"Month Total",       val:`${presTotal} att.`,  time:`${absTotal} absences` },
            ].map((m,i)=>(
              <Flex key={i} align="center" gap={3} py={1.5}
                borderBottom={i<2?"1px solid":"none"} borderColor="gray.50">
                <Flex direction="column" align="center" justify="center" w={9} h={9}
                  bg={m.color} borderRadius="xl" flexShrink={0}>
                  <Text fontSize="11px" fontWeight="800" color="white" lineHeight={1}>{m.day}</Text>
                  <Text fontSize="9px" color="whiteAlpha.800" lineHeight={1}>{m.date}</Text>
                </Flex>
                <Box flex={1} minW={0}>
                  <Text fontSize="xs" fontWeight="700" color="gray.800" noOfLines={1}>{m.label}</Text>
                  <Text fontSize="10px" color="gray.400">{m.time}</Text>
                </Box>
                <Text fontSize="xs" fontWeight="700" color="gray.600" flexShrink={0}>{m.val}</Text>
                <Icon as={FaChevronRight} boxSize={2.5} color="gray.300"/>
              </Flex>
            ))}
          </Box>
        </Panel>
      </Grid>
    </Flex>
  );
};

/* ══════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════ */
const DashboardHome = () => {
  const { user }  = useContext(AuthContext);
  const isManager = user?.role === "Manager";
  const [data, setData] = useState({
    summary:{ totalEmployees:0, attendanceToday:0, pendingLeaves:0, monthlyPayroll:0 },
    attendance:[], leaves:[], payroll:[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async()=>{
      try {
        const reqs=[api.get("/dashboard/summary"),api.get("/dashboard/attendance-chart"),api.get("/dashboard/leave-stats")];
        if(!isManager) reqs.push(api.get("/dashboard/payroll-stats"));
        const res=await Promise.all(reqs);
        setData({ summary:res[0].data, attendance:res[1].data, leaves:res[2].data, payroll:res[3]?.data||[] });
      } catch(e){ console.error(e); }
      finally{ setLoading(false); }
    })();
  },[isManager]);

  if(loading) return (
    <Flex justify="center" align="center" h="100vh" direction="column" gap={4}>
      <Spinner size="xl" color="#059669" thickness="4px" speed="0.6s"/>
      <Text fontSize="sm" color="gray.400" fontWeight="500">Loading dashboard...</Text>
    </Flex>
  );

  return isManager ? <ManagerDashboard data={data}/> : <AdminDashboard data={data}/>;
};

export default DashboardHome;
