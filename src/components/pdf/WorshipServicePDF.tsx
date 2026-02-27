import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingBottom: 10,
    },
    churchName: {
        fontSize: 12,
        color: '#64748B',
        textTransform: 'uppercase',
        marginBottom: 5,
        letterSpacing: 2,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 12,
        color: '#475569',
    },
    section: {
        marginBottom: 10,
        padding: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: '#F1F5F9',
        flexDirection: 'row',
    },
    timeCol: {
        width: '15%',
    },
    time: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#334155',
    },
    duration: {
        fontSize: 10,
        color: '#94A3B8',
        marginTop: 2,
    },
    mainCol: {
        width: '50%',
        paddingRight: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 4,
    },
    content: {
        fontSize: 10,
        color: '#475569',
        whiteSpace: 'pre-wrap',
        lineHeight: 1.4,
    },
    rolesCol: {
        width: '35%',
        paddingLeft: 10,
        borderLeftWidth: 1,
        borderLeftColor: '#F1F5F9',
    },
    roleItem: {
        marginBottom: 4,
    },
    roleName: {
        fontSize: 8,
        color: '#94A3B8',
        textTransform: 'uppercase',
    },
    personName: {
        fontSize: 10,
        color: '#334155',
        fontWeight: 'bold',
    },
    empty: {
        fontSize: 10,
        color: '#CBD5E1',
        fontStyle: 'italic',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        fontSize: 10,
        color: '#CBD5E1',
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 10,
    },
});

interface WorshipServicePDFProps {
    service: any;
}

export const WorshipServicePDF: React.FC<WorshipServicePDFProps> = ({ service }) => {
    const serviceDate = new Date(service.date);
    let currentOffset = 0;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.churchName}>{service.church?.name || 'IGLESIA'}</Text>
                    <Text style={styles.title}>{service.topic || 'Culto de Adoración'}</Text>
                    <Text style={styles.subtitle}>
                        {format(serviceDate, "EEEE d 'de' MMMM, yyyy - HH:mm 'hs'", { locale: es })}
                    </Text>
                </View>

                {/* Global Sections (General Staff) */}
                {(() => {
                    const globalSections = service.sections?.filter((s: any) => s.type === 'GLOBAL') || [];
                    if (globalSections.length === 0) return null;

                    return (
                        <View style={{ marginBottom: 15, padding: 10, backgroundColor: '#F8FAFC', borderRadius: 4 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#64748B', marginBottom: 5, textTransform: 'uppercase' }}>
                                Equipo General
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                {globalSections.map((section: any) => (
                                    section.filledRoles?.map((role: any, rIdx: number) => (
                                        <View key={`${section.id}-${rIdx}`} style={{ width: '33%', marginBottom: 4 }}>
                                            <Text style={styles.roleName}>{role.role.name}</Text>
                                            <Text style={styles.personName}>
                                                {role.assignedPerson ? `${role.assignedPerson.firstName} ${role.assignedPerson.lastName}` : 'Sin asignar'}
                                            </Text>
                                        </View>
                                    ))
                                ))}
                            </View>
                        </View>
                    );
                })()}

                {/* Timeline Sections */}
                {service.sections?.filter((s: any) => s.type !== 'GLOBAL').map((section: any, idx: number) => {
                    // Logic to find leaders/speakers
                    const timelineRoles = section.filledRoles || [];

                    const musicLeader = timelineRoles.find((r: any) => r.role.behaviorType === 'MUSIC_LEADER');
                    const speaker = timelineRoles.find((r: any) => r.role.behaviorType === 'SPEAKER');
                    const announcements = timelineRoles.find((r: any) => r.role.behaviorType === 'ANNOUNCEMENTS');

                    const startTime = new Date(serviceDate.getTime() + (currentOffset * 60000));
                    const timeStr = format(startTime, 'HH:mm');
                    currentOffset += (section.duration || 15);

                    return (
                        <View key={idx} style={styles.section} wrap={false}>
                            <View style={styles.timeCol}>
                                <Text style={styles.time}>{timeStr}</Text>
                                <Text style={styles.duration}>{section.duration || 15} min</Text>
                            </View>

                            <View style={styles.mainCol}>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                                {section.content && (
                                    <View>
                                        <Text style={styles.content}>{section.content}</Text>
                                    </View>
                                )}
                                {announcements && announcements.metadata?.title && (
                                    <View style={{ marginTop: 5, padding: 5, backgroundColor: '#FFFBEB', borderRadius: 4 }}>
                                        <Text style={{ fontSize: 8, color: '#D97706', marginBottom: 2 }}>ANUNCIOS:</Text>
                                        <Text style={styles.content}>{announcements.metadata.title}</Text>
                                    </View>
                                )}
                                {/* Render Metadata from Roles (Sermon Title, Passage, etc.) here */}
                                {timelineRoles.map((role: any, rIdx: number) => {
                                    if (!role.metadata?.title && !role.metadata?.passage) return null;
                                    // Skip announcements as they are handled above
                                    if (role.role.behaviorType === 'ANNOUNCEMENTS') return null;

                                    return (
                                        <View key={`meta-${rIdx}`} style={{ marginTop: 4 }}>
                                            {role.metadata.title && (
                                                <Text style={{ fontSize: 10, fontStyle: 'italic', color: '#334155', fontWeight: 'medium' }}>
                                                    "{role.metadata.title}"
                                                </Text>
                                            )}
                                            {role.metadata.passage && (
                                                <Text style={{ fontSize: 9, color: '#64748B', marginTop: 1 }}>
                                                    {role.metadata.passage}
                                                </Text>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>

                            <View style={styles.rolesCol}>
                                {timelineRoles.length > 0 ? (
                                    timelineRoles.map((role: any, rIdx: number) => (
                                        <View key={rIdx} style={styles.roleItem}>
                                            <Text style={styles.roleName}>{role.role.name}</Text>
                                            <Text style={styles.personName}>
                                                {role.assignedPerson ? `${role.assignedPerson.firstName} ${role.assignedPerson.lastName}` : 'Sin asignar'}
                                            </Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.empty}>-</Text>
                                )}
                            </View>
                        </View>
                    );
                })}

                <Text style={styles.footer} fixed>
                    Generado el {format(new Date(), 'dd/MM/yyyy HH:mm')} - Ecclesia SaaS
                </Text>
            </Page>
        </Document>
    );
};
