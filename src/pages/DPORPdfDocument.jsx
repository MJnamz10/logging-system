import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
  },
  entryContainer: {
    marginBottom: 40, 
    // Removed wrap={false} to prevent infinite rendering loops on large entries
  },
  reportDate: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 15,
  },
  dporFor: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 15,
  },
  bodyText: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    marginBottom: 2, 
  },
  sectionSpacer: {
    marginTop: 15,
  },
  personnelText: {
    marginTop: 15,
    fontSize: 10,
    fontFamily: 'Helvetica-Bold', 
    fontWeight: 'bold',
    textDecoration: 'underline',  
  },
  signatureContainer: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'flex-end', 
  },
  signatureBox: {
    width: 150,
    borderTopWidth: 1, 
    borderTopColor: '#000',
    paddingTop: 5,
    alignItems: 'center', 
  },
  signatureText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    fontWeight: 'bold',
  }
});

const DPORPdfDocument = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>No entries found.</Text>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {data.map((entry, index) => {
          const remarksLines = entry.operational_remarks 
            ? entry.operational_remarks.split('\n') 
            : [];

          return (
            <View key={index} style={styles.entryContainer}>
              
              <Text style={styles.reportDate}>
                {entry.report_date ? entry.report_date.toUpperCase() : "DATE UNKNOWN"}
              </Text>

              <Text style={styles.dporFor}>
                DPOR FOR {entry.dpor_for ? entry.dpor_for.toUpperCase() : "DATE UNKNOWN"}
              </Text>

              <View>
                {remarksLines.length > 0 ? (
                  remarksLines.map((line, i) => (
                    <Text key={i} style={styles.bodyText}>{line}</Text>
                  ))
                ) : (
                  <Text style={styles.bodyText}>NO REMARKS</Text>
                )}
              </View>

              <View style={styles.sectionSpacer}>
                <Text style={styles.bodyText}>
                  {entry.staff_on_ot ? `${entry.staff_on_ot.toUpperCase()} ON OT` : "NO STAFF ON OT"}
                </Text>
              </View>

              <Text style={styles.personnelText}>
                {entry.personnel_count || "0 CNSSO, 0 ALPTS, 0 JO PRESENT"}
              </Text>

              <View style={styles.signatureContainer}>
                <View style={styles.signatureBox}>
                  <Text style={styles.signatureText}>
                    {entry.signatory ? entry.signatory.toUpperCase() : "ANS FIC"}
                  </Text>
                </View>
              </View>

            </View>
          );
        })}

      </Page>
    </Document>
  );
};

export default DPORPdfDocument;