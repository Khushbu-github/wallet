// File: app/chart.tsx
import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Dimensions, 
  StyleSheet,
  TouchableOpacity 
} from 'react-native';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const screenWidth = width;
const isMobile = width <= 480;

export default function ChartScreen() {
  const { applied_strategy, expected_return, sharpe_ratio, strategy_label } = useLocalSearchParams();
  const router = useRouter();

  // Parse applied_strategy if it's a JSON string
  let parsedStrategy = {};
  try {
    parsedStrategy = typeof applied_strategy === 'string' 
      ? JSON.parse(applied_strategy) 
      : applied_strategy || {};
  } catch (error) {
    console.error('Error parsing applied_strategy:', error);
    parsedStrategy = { ETH: 33, USDC: 33, LINK: 34 }; // Fallback
  }

  // Ensure we have valid numbers
  const returnValue = parseFloat(expected_return?.toString() || '12');
  const sharpeValue = parseFloat(sharpe_ratio?.toString() || '1.4');

  // Generate pie chart data
  const pieData = Object.entries(parsedStrategy).map(([key, value], index) => ({
    name: key,
    population: typeof value === 'number' ? value : parseFloat(value.toString() || '0'),
    color: ['#627EEA', '#2775CA', '#375BD2', '#109618'][index % 4],
    legendFontColor: '#dcdcdc',
    legendFontSize: 14,
  }));

  // Chart configuration for dark theme
  const chartConfig = {
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    color: (opacity = 1) => `rgba(187, 134, 252, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(220, 220, 220, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 1,
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.gradient}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="#bb86fc" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>📊 Portfolio Analysis</Text>
              <Text style={styles.subtitle}>
                {strategy_label || 'Strategy Implementation'}
              </Text>
            </View>
          </View>

          {/* Asset Allocation Section */}
          <BlurView intensity={15} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pie-chart" size={24} color="#bb86fc" />
              <Text style={styles.sectionTitle}>Asset Allocation</Text>
            </View>
            
            <View style={styles.chartContainer}>
              <PieChart
                data={pieData}
                width={screenWidth - 60}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[10, 10]}
                absolute
              />
            </View>

            {/* Allocation Details */}
            <View style={styles.allocationDetails}>
              {Object.entries(parsedStrategy).map(([asset, percentage], index) => (
                <View key={asset} style={styles.allocationRow}>
                  <View style={styles.assetInfo}>
                    <View style={[
                      styles.colorIndicator, 
                      { backgroundColor: ['#627EEA', '#2775CA', '#375BD2'][index] }
                    ]} />
                    <Text style={styles.assetName}>{asset}</Text>
                  </View>
                  <Text style={styles.percentageText}>
                    {typeof percentage === 'number' ? percentage : parseFloat(percentage?.toString() || '0')}%
                  </Text>
                </View>
              ))}
            </View>
          </BlurView>

          {/* Performance Metrics Section */}
          <BlurView intensity={15} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bar-chart" size={24} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Performance Metrics</Text>
            </View>
            
            <View style={styles.chartContainer}>
              <BarChart
                data={{
                  labels: ['Expected Return', 'Sharpe Ratio'],
                  datasets: [{
                    data: [returnValue, sharpeValue],
                  }],
                }}
                width={screenWidth - 60}
                height={220}
                yAxisSuffix={returnValue > 10 ? "%" : ""}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                }}
                verticalLabelRotation={0}
                showBarTops={true}
                fromZero={true}
              />
            </View>

            {/* Metrics Details */}
            <View style={styles.metricsDetails}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Expected Return</Text>
                <Text style={styles.metricValue}>{returnValue.toFixed(1)}%</Text>
                <Text style={styles.metricSubtext}>Annual projected return</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Sharpe Ratio</Text>
                <Text style={styles.metricValue}>{sharpeValue.toFixed(2)}</Text>
                <Text style={styles.metricSubtext}>Risk-adjusted return</Text>
              </View>
            </View>
          </BlurView>

          {/* Growth Projection Section */}
          <BlurView intensity={15} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trending-up" size={24} color="#FF9800" />
              <Text style={styles.sectionTitle}>Growth Projection</Text>
            </View>
            
            <View style={styles.chartContainer}>
              <LineChart
                data={{
                  labels: ['Now', '1Y', '2Y', '3Y', '4Y'],
                  datasets: [{
                    data: [
                      100, 
                      100 * (1 + returnValue/100), 
                      100 * Math.pow(1 + returnValue/100, 2),
                      100 * Math.pow(1 + returnValue/100, 3),
                      100 * Math.pow(1 + returnValue/100, 4)
                    ],
                    color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
                    strokeWidth: 3,
                  }],
                }}
                width={screenWidth - 60}
                height={220}
                yAxisPrefix="$"
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
                }}
                bezier
                style={styles.lineChart}
              />
            </View>

            <Text style={styles.projectionNote}>
              💡 Projection based on {returnValue}% annual return assumption
            </Text>
          </BlurView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.back()}
            >
              <LinearGradient
                colors={['#bb86fc', '#9c6ff5']}
                style={styles.buttonGradient}
              >
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.buttonText}>Try Another Strategy</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                // Navigate to implementation or home
                router.push('/');
              }}
            >
              <LinearGradient
                colors={['#4CAF50', '#45a049']}
                style={styles.buttonGradient}
              >
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.buttonText}>Implement Strategy</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(187, 134, 252, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: isMobile ? 24 : 28,
    fontWeight: 'bold',
    color: '#bb86fc',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#dcdcdc',
    opacity: 0.8,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(187, 134, 252, 0.2)',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dcdcdc',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  allocationDetails: {
    gap: 12,
  },
  allocationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  assetName: {
    color: '#dcdcdc',
    fontSize: 16,
    fontWeight: '600',
  },
  percentageText: {
    color: '#bb86fc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  metricsDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  metricLabel: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricValue: {
    color: '#dcdcdc',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricSubtext: {
    color: '#dcdcdc',
    fontSize: 10,
    opacity: 0.7,
    textAlign: 'center',
  },
  lineChart: {
    borderRadius: 12,
  },
  projectionNote: {
    color: '#dcdcdc',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});