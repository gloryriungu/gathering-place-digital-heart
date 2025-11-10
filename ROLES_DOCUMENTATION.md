# USER ROLES & PERMISSIONS DOCUMENTATION

## Overview
This church management system implements a hierarchical role-based access control (RBAC) system with 14 distinct user roles. Each role has specific permissions and access to different features based on their responsibilities within the church organization.

---

## 1. FOUNDER ROLE
**Department**: Executive Leadership  
**Access Level**: Highest (Full System Access)  
**Primary Dashboard**: Main Dashboard with founder-specific tabs

### Responsibilities
- Ultimate oversight of all church operations
- Strategic planning and decision-making
- Financial oversight and budget approval
- System-wide analytics and reporting
- All-department visibility and management

### Permissions & Features
- **Advanced Analytics**: Complete access to all analytics modules including:
  - Church growth metrics and trends
  - Member engagement statistics
  - Financial performance analysis
  - Department performance metrics
  - Predictive analytics for planning
- **Demographics Analytics**: Comprehensive demographic data including:
  - Age distribution analysis
  - Gender demographics
  - Location mapping and geographic distribution
  - Occupation analysis
  - Family structure insights
  - Member retention rates
- **Budget Management**:
  - Review and approve all budget proposals from departments
  - Create organizational budgets
  - Financial forecasting
  - Expense tracking across all departments
- **Inventory Management**: View inventory for ALL departments
- **User Management**: View and manage all users across the system
- **Reports Access**: Generate and view all types of reports
- **System Overview**: Monitor overall system health and usage
- **Full Database Access**: Can query and view all database tables
- **Requisition Management**: Oversee all requisitions across departments

### Technical Implementation
```typescript
// Role assignment in user_roles table
role: 'founder'

// Access pattern in code
if (userRole === 'founder') {
  // Grant access to all features
  // Show advanced analytics
  // Enable budget approval
}
```

---

## 2. SENIOR PASTOR ROLE
**Department**: Pastoral Leadership  
**Access Level**: Executive  
**Primary Dashboard**: Pastor's Dashboard

### Responsibilities
- Spiritual oversight of the congregation
- Ministry leadership and direction
- Staff supervision and support
- Budget review and financial accountability
- Member care and pastoral counseling

### Permissions & Features
- **Demographics Analytics**: Access to:
  - Member demographics for pastoral planning
  - Family structure insights
  - Community engagement metrics
- **Giving Analysis**: 
  - Review giving trends and patterns
  - Identify opportunities for stewardship teaching
  - Monitor financial health of the church
  - Track tithing percentages
- **Budget Review**:
  - Review department budget proposals
  - Approve ministry budgets
  - Monitor financial performance
- **Inventory Visibility**: View inventory across all departments
- **Activity Logs**: Monitor system activities and changes
- **User Management**: View all user profiles for pastoral care
- **Content Management**: 
  - Approve sermons and teaching content
  - Manage church announcements
  - Oversee communications

### Technical Implementation
```typescript
role: 'senior_pastor'

// Dashboard tabs available
tabs: [
  'demographics',
  'giving-analysis', 
  'budget-review',
  'inventory',
  'activity-logs',
  'users'
]
```

---

## 3. ADMIN ROLE
**Department**: Church Administration  
**Access Level**: High (Administrative Control)  
**Primary Dashboard**: Admin Dashboard

### Responsibilities
- System administration and configuration
- User account management
- Module and feature management
- Department coordination
- Overall system maintenance

### Permissions & Features
- **Dashboard Statistics**: View comprehensive church statistics
- **Quick Actions**: Access to administrative shortcuts
- **Module Management**: Enable/disable system modules
- **Recent Activity Monitoring**: Track all system changes
- **AI Insights**: Access to AI-powered recommendations
- **Ministries Management**: Create and manage ministry programs
- **Serve Management**: Oversee volunteer departments
- **Applications Review**: Process ministry and volunteer applications
- **Inventory Management**: Full inventory access across departments
- **Reports Generation**: Create comprehensive reports
- **User Management**: Full user administration capabilities
- **Department Requisitions**: Approve purchase requests
- **Content Management**: Edit website content

### Technical Implementation
```typescript
role: 'admin'

// Features accessible
features: [
  'ministries',
  'serve-management',
  'applications',
  'inventory',
  'reports',
  'users',
  'content-management',
  'requisitions-approval'
]
```

---

## 4. IT ROLE
**Department**: Information Technology  
**Access Level**: System Administrator  
**Primary Dashboard**: Main Dashboard with IT-specific tabs

### Responsibilities
- Technical system maintenance
- User technical support
- System security monitoring
- Database management
- Troubleshooting and issue resolution
- Tab and feature visibility management

### Permissions & Features
- **User Management**: 
  - Create, edit, and delete user accounts
  - Assign and modify user roles
  - Reset passwords
  - Manage user permissions
- **System Logs**: 
  - View all system activity logs
  - Monitor error logs
  - Track security events
  - Audit user actions
- **Support Ticketing System**:
  - Receive and manage support tickets
  - Assign priority levels
  - Track resolution status
  - Maintain ticket history
- **System Monitoring**:
  - Server health monitoring
  - Performance metrics
  - Resource utilization
  - Database performance
- **Security Management**:
  - Configure security settings
  - Monitor authentication attempts
  - Manage access controls
  - Review security logs
- **Tab Management**: 
  - Control which tabs are visible to different roles
  - Enable/disable features system-wide
  - Configure department-specific interfaces
- **Requisitions Management**: Process IT-related purchases
- **All Inventory Access**: View and manage all department inventories
- **Override Access**: Can access any role-restricted area for support

### Technical Implementation
```typescript
role: 'it'

// Special override in AuthGuard
hasAccess = allowedRoles.includes(userRole) || userRole === 'it'

// IT-specific features
features: [
  'user-management',
  'system-logs',
  'ticketing',
  'monitoring',
  'security',
  'tab-management',
  'requisitions',
  'inventory'
]
```

---

## 5. PASTOR ROLE
**Department**: Pastoral Staff  
**Access Level**: Ministry Leadership  
**Primary Dashboard**: Pastor's Dashboard

### Responsibilities
- Individual pastoral care
- Counseling and mentoring
- Ministry oversight
- Availability scheduling
- Member spiritual guidance

### Permissions & Features
- **Availability Management**:
  - Set counseling session availability
  - Manage appointment calendar
  - Block off personal time
  - View scheduled sessions
- **Counseling Management**:
  - View counseling requests
  - Schedule counseling sessions
  - Track counseling history
  - Manage session notes (private)
- **Ministries Viewing**: 
  - View all ministry programs
  - See ministry participation
  - Access ministry resources
- **Department Viewing**: 
  - View all volunteer departments
  - See volunteer assignments
  - Access department resources
- **User Viewing**: Access to member contact information
- **Content Management**: Contribute sermons and teaching materials
- **Demographics Access**: View demographics for ministry planning

### Technical Implementation
```typescript
role: 'pastor'

// Dashboard configuration
tabs: [
  'availability',
  'counseling',
  'ministries-view',
  'serve-view',
  'users'
]

// Access protected pages
allowedRoles: ['pastor', 'senior_pastor', 'admin', 'it']
```

---

## 6. REGISTRATION ROLE
**Department**: Member Registration  
**Access Level**: Department Specialist  
**Primary Dashboard**: Registration Dashboard

### Responsibilities
- Member registration and data entry
- Attendance tracking
- QR code scanning for check-ins
- Member profile management
- Family linking and relationships
- Data import and migration

### Permissions & Features
- **QR Scanner**: 
  - Scan member QR codes for quick check-in
  - Real-time attendance recording
  - Service type selection
  - Date-specific attendance tracking
- **Attendance Tracking**:
  - Manual attendance entry
  - View attendance history
  - Track attendance trends
  - Generate attendance reports
- **Member Management**:
  - Add new members
  - Edit member information
  - Update contact details
  - Manage member status
  - Family relationship tracking
- **Import Members**:
  - Bulk import from CSV/Excel
  - Data validation
  - Duplicate detection
  - Import history tracking
- **Member Linking**:
  - Connect duplicate profiles
  - Link family members
  - Merge member records
  - Relationship management
- **Reports Generation**:
  - Attendance reports
  - Membership reports
  - Growth statistics
  - Demographic summaries
- **Family Applications**: Review applications to join church family

### Technical Implementation
```typescript
role: 'registration'

// Auto-redirect to specialized dashboard
useEffect(() => {
  if (userRole === 'registration') {
    navigate('/registration-dashboard');
  }
}, [userRole]);

// Features available
tabs: [
  'qr-scanner',
  'attendance',
  'members',
  'import',
  'linking',
  'reports',
  'profile'
]
```

---

## 7. ACCOUNTS ROLE
**Department**: Finance & Accounting  
**Access Level**: Financial Management  
**Primary Dashboard**: Main Dashboard with accounts-specific tabs

### Responsibilities
- Financial record-keeping
- Donation processing and recording
- Budget creation
- Requisition approval
- Financial reporting
- Giving analysis

### Permissions & Features
- **Giving Records**:
  - Record donations and tithes
  - Track payment methods
  - Issue giving receipts
  - Maintain donor records
- **Giving Analysis**:
  - Analyze giving trends
  - Generate financial reports
  - Track pledges vs. actual giving
  - Donor engagement metrics
- **Requisitions Management**:
  - Review department purchase requests
  - Approve/deny requisitions
  - Track requisition status
  - Budget impact analysis
  - Can ONLY view their own requisitions (security measure)
- **Inventory Management**: Track financial value of inventory
- **Budget Creation**:
  - Create organizational budgets
  - Submit budget proposals
  - Track budget vs. actual spending
  - Financial forecasting
- **Contributions Tracking**: Comprehensive donation management
- **Financial Reports**: Generate financial statements and reports

### Technical Implementation
```typescript
role: 'accounts'

// Special filtering for requisitions
if (userRole === 'accounts') {
  // Can only see own requisitions
  query = query.eq('submitted_by', user.id);
}

// Cannot create requisitions, only review
canCreateRequisitions = false;
canManageRequisitions = userRole === 'accounts';
```

---

## 8. MEDIA ROLE
**Department**: Media & Production  
**Access Level**: Department Specialist  
**Primary Dashboard**: Media Dashboard

### Responsibilities
- Content creation and management
- Live streaming operations
- Video/audio production
- Media library management
- Technical production setup

### Permissions & Features
- **Sermons Management**:
  - Upload sermon videos
  - Manage sermon metadata
  - Organize sermon series
  - Track viewing statistics
- **Announcements**: Create and schedule video announcements
- **Events Management**:
  - Create event listings
  - Upload event media
  - Manage event registrations
  - Track RSVPs
- **Live Streaming**:
  - Configure live streams
  - Manage streaming schedule
  - Monitor viewer engagement
  - Archive past streams
- **Hero Content Management**: Update homepage hero sections
- **Watch Page Management**: Curate watch page content
- **Shop Management**: Manage media products (books, merchandise)
- **Requisitions**: Request equipment and supplies
- **Inventory**: Track media equipment and assets

### Technical Implementation
```typescript
role: 'media'

// Auto-redirect to specialized dashboard
useEffect(() => {
  if (userRole === 'media') {
    navigate('/media-dashboard');
  }
}, [userRole]);

// Media Dashboard tabs
tabs: [
  'sermons',
  'announcements', 
  'events',
  'live-stream',
  'hero-content',
  'watch-page',
  'shop',
  'requisitions',
  'inventory'
]
```

---

## 9. MARKETING ROLE
**Department**: Marketing & Communications  
**Access Level**: Department Specialist  
**Primary Dashboard**: Marketing Dashboard

### Responsibilities
- Marketing strategy and campaigns
- Social media management
- Newsletter creation
- Website content management
- Brand management
- Public relations

### Permissions & Features
- **About Us Management**:
  - Edit church story and mission
  - Update leadership profiles
  - Manage church values
- **Testimonials Management**:
  - Collect and publish testimonials
  - Moderate submitted stories
  - Organize testimonial categories
- **FAQ Management**:
  - Create frequently asked questions
  - Organize FAQ categories
  - Update answers
- **Newsletter CRM**:
  - Manage subscriber lists
  - Create newsletter campaigns
  - Track open rates and engagement
  - Segment audiences
- **Social Media Management**:
  - Schedule social posts
  - Monitor social engagement
  - Track social analytics
  - Manage multiple platforms
- **Notice of Filming**: Manage filming consent and notices
- **Requisitions**: Request marketing materials and tools
- **Inventory**: Track marketing assets and supplies

### Technical Implementation
```typescript
role: 'marketing'

// Auto-redirect to specialized dashboard
useEffect(() => {
  if (userRole === 'marketing') {
    navigate('/marketing-dashboard');
  }
}, [userRole]);

// Marketing Dashboard tabs
tabs: [
  'about-us',
  'testimonials',
  'faq',
  'newsletter',
  'social-media',
  'notice-filming',
  'requisitions',
  'inventory'
]
```

---

## 10. SUNDAY_SCHOOL ROLE
**Department**: Sunday School Administration  
**Access Level**: Ministry Specialist  
**Primary Dashboard**: Main Dashboard with sunday_school tabs

### Responsibilities
- Sunday school program oversight
- Curriculum management
- Class scheduling
- Teacher coordination
- Student enrollment
- Parent communication

### Permissions & Features
- **Sunday School Dashboard**:
  - View all classes and enrollment
  - Monitor attendance across classes
  - Track student progress
  - Manage class schedules
  - Assign teachers to classes
- **Reports Generation**:
  - Attendance reports
  - Enrollment statistics
  - Teacher performance
  - Student progress reports
- **Curriculum Access**: View and organize teaching materials
- **Teacher Management**: Oversee teacher assignments
- **Student Management**: Manage student enrollments

### Technical Implementation
```typescript
role: 'sunday_school'

// Available features
tabs: [
  'sunday-school',
  'reports'
]

// Can view all classes
<SundaySchoolDashboard role="admin" />
```

---

## 11. TEACHER ROLE
**Department**: Sunday School Teaching  
**Access Level**: Class Instructor  
**Primary Dashboard**: Main Dashboard with teacher-specific tabs

### Responsibilities
- Individual class instruction
- Attendance tracking for specific class
- Student assessment
- Parent communication
- Curriculum delivery

### Permissions & Features
- **Teacher Dashboard**:
  - View assigned class only
  - Track student attendance
  - Record student progress
  - Access teaching materials
  - Communicate with parents
- **Reports**: 
  - Class attendance reports
  - Student progress reports
  - Personal teaching statistics
- **Class Management**: Manage only assigned class
- **Limited Scope**: Cannot view other teachers' classes

### Technical Implementation
```typescript
role: 'teacher'

// Restricted to own class
tabs: [
  'teacher-dashboard',
  'reports'
]

// Shows only assigned class
<TeacherInterface teacherId={userId} />
```

---

## 12. SOUND ROLE
**Department**: Sound & Audio  
**Access Level**: Department Specialist  
**Primary Dashboard**: Main Dashboard with department tabs

### Responsibilities
- Sound system operation
- Audio equipment maintenance
- Sound check coordination
- Equipment inventory management

### Permissions & Features
- **Requisitions**: Request sound equipment and supplies
- **Inventory**: Track sound equipment and assets
- **Department-Specific Access**: Limited to sound department operations

### Technical Implementation
```typescript
role: 'sound'

tabs: [
  'requisitions',
  'inventory'
]

// Department-scoped inventory
<DepartmentInventory departmentId="sound" />
```

---

## 13. SECURITY ROLE
**Department**: Church Security  
**Access Level**: Department Specialist  
**Primary Dashboard**: Main Dashboard with department tabs

### Responsibilities
- Facility security
- Safety protocols
- Emergency response
- Security equipment management

### Permissions & Features
- **Requisitions**: Request security equipment
- **Inventory**: Track security equipment
- **Department Operations**: Security-specific features

### Technical Implementation
```typescript
role: 'security'

tabs: [
  'requisitions',
  'inventory'
]

// Department-scoped inventory
<DepartmentInventory departmentId="security" />
```

---

## 14. USER ROLE
**Department**: General Membership  
**Access Level**: Basic Member  
**Primary Dashboard**: Main Dashboard with member features

### Responsibilities
- Personal spiritual growth
- Church engagement
- Financial giving
- Ministry participation
- Event attendance

### Permissions & Features
- **Overview**: Personal dashboard with stats and quick actions
- **Give**: Access donation interface
- **Profile**: Manage personal information
- **Newsletter**: Subscribe to church communications
- **Join Family**: Apply to join church family
- **Apply to Ministry**: Submit ministry applications
- **Apply to Serve**: Submit volunteer applications
- **Book Counseling**: Request pastoral counseling sessions
- **My Giving**: View personal giving history
- **Events**: View and register for church events
- **Limited Access**: Cannot view administrative features

### Technical Implementation
```typescript
role: 'user'

// Default role for new members
setUserRole('user');

// Basic member features
tabs: [
  'overview',
  'give',
  'profile',
  'newsletter',
  'join-family',
  'apply-ministry',
  'apply-serve',
  'counseling-book',
  'giving',
  'events'
]
```

---

## ROLE HIERARCHY & ACCESS CONTROL

### Access Level Pyramid
```
                    FOUNDER
                      |
               SENIOR_PASTOR
                      |
        +-------------+-------------+
        |                           |
      ADMIN                        IT
        |                           |
    +---+---+               +-------+-------+
    |       |               |       |       |
 PASTOR  ACCOUNTS    REGISTRATION  MEDIA  MARKETING
                            |
                    +-------+-------+
                    |               |
              SUNDAY_SCHOOL      SOUND
                    |           SECURITY
                 TEACHER
                    |
                  USER
```

### Role Assignment Rules
1. **Roles are stored in `user_roles` table** (NOT in profiles or auth.users)
2. **Security Definer Function** used to check roles (prevents RLS recursion)
3. **IT role has override access** to all areas for support purposes
4. **Multiple roles possible** but system uses highest priority role
5. **Role priority** (from highest to lowest):
   - founder > senior_pastor > admin > it > pastor > accounts > registration > media > marketing > sunday_school > teacher > user

### Technical Security Implementation

```sql
-- Role enum definition
CREATE TYPE public.app_role AS ENUM (
  'founder',
  'senior_pastor', 
  'admin',
  'it',
  'pastor',
  'accounts',
  'registration',
  'media',
  'marketing',
  'sunday_school',
  'teacher',
  'user',
  'sound',
  'security'
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

### AuthGuard Implementation
```typescript
// Component-level protection
<AuthGuard requiredRole="admin">
  {/* Admin-only content */}
</AuthGuard>

// Multiple allowed roles
<AuthGuard allowedRoles={['admin', 'pastor', 'senior_pastor']}>
  {/* Content for specified roles */}
</AuthGuard>

// IT override is automatic
const hasAccess = allowedRoles.includes(userRole) || userRole === 'it';
```

---

## ROLE MODIFICATION & MANAGEMENT

### How Roles Are Assigned
1. **Initial Assignment**: New users default to 'user' role
2. **Role Upgrade**: IT or Admin can assign additional roles via User Management
3. **Role Change**: Roles can be updated in real-time
4. **Role Refresh**: System automatically refreshes role on dashboard load
5. **Real-time Updates**: Role changes trigger re-authentication checks

### Role Management Interface (IT/Admin Access)
- Located in: **User Management** tab
- Capabilities:
  - View all users and their roles
  - Assign new roles to users
  - Remove roles from users
  - View role assignment history
  - Bulk role operations

---

## COMMON ROLE COMBINATIONS

### Typical Staff Role Sets
- **Lead Pastor**: `senior_pastor` + `pastor`
- **Church Administrator**: `admin` + `accounts`
- **IT Director**: `it` + `admin`
- **Worship Leader**: `media` + `sound`
- **Communications Director**: `marketing` + `media`
- **Sunday School Director**: `sunday_school` + `teacher`

---

## SECURITY CONSIDERATIONS

### Role-Based Security Rules
1. ✅ **DO**: Store roles in separate `user_roles` table
2. ✅ **DO**: Use security definer functions for role checks
3. ✅ **DO**: Implement server-side validation
4. ❌ **DON'T**: Store roles in localStorage (can be manipulated)
5. ❌ **DON'T**: Use client-side role checks for sensitive operations
6. ❌ **DON'T**: Hardcode admin credentials
7. ❌ **DON'T**: Store roles directly in profiles table (privilege escalation risk)

### RLS Policy Example
```sql
-- Example: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));
```

---

## TROUBLESHOOTING ROLE ISSUES

### Common Issues & Solutions

**Issue**: User can't access dashboard after role assignment
- **Solution**: Call `refreshRole()` function or have user re-login

**Issue**: IT user can't access protected area
- **Solution**: Check AuthGuard implementation includes IT override

**Issue**: Role not updating in real-time
- **Solution**: Ensure real-time subscription to user_roles table is active

**Issue**: Infinite recursion in RLS policies
- **Solution**: Use security definer function instead of direct table query

---

## AUDIT & LOGGING

All role changes are tracked in the `activity_logs` table:
- User who made the change
- Timestamp of change
- Previous role
- New role
- Reason for change (if provided)

Viewable by: Founder, Senior Pastor, Admin, IT

---

## CONTACT & SUPPORT

For role-related issues or access requests:
1. Contact IT Department
2. Submit support ticket in IT Ticketing System
3. Reach out to Church Administrator

---

**Document Version**: 1.0  
**Last Updated**: 2025  
**Maintained By**: IT Department  
**Review Schedule**: Quarterly
