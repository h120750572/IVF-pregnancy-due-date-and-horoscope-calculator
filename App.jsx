import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CalendarDays, Baby, Heart, Star, Calculator, BookOpen, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react'
import { 
  calculateEDCFromLMP, 
  calculateLMPFromImplant, 
  calculatePregnancyWeeks, 
  estimateFetalWeight, 
  calculateZodiacSign, 
  formatDate, 
  formatPregnancyWeeks,
  getZodiacTraits 
} from './lib/calculations'
import { 
  calculateZodiacImplantation, 
  ZODIAC_RANGES, 
  getEmbryoTypeName,
  isImplantationDateReasonable 
} from './lib/zodiacReverseCalculations'
import { getEducationByWeeks, generalEducation } from './lib/educationData'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('lmp')
  const [results, setResults] = useState(null)
  const [formData, setFormData] = useState({
    lmpDate: '',
    implantDate: '',
    embryoDay: '3',
    targetZodiac: '',
    targetYear: new Date().getFullYear() + 1,
    embryoType: 'fresh_day5'
  })

  const handleCalculate = () => {
    console.log('handleCalculate called, activeTab:', activeTab);
    console.log('formData:', formData);
    
    let lmpDate
    let implantDate
    let embryoDay = 3

    try {
      if (activeTab === 'lmp') {
        if (!formData.lmpDate) {
          alert('請輸入最後月經日期')
          return
        }
        lmpDate = new Date(formData.lmpDate)
      } else if (activeTab === 'implant') {
        if (!formData.implantDate || !formData.embryoDay) {
          alert('請輸入植入日期和胚胎天數')
          return
        }
        implantDate = new Date(formData.implantDate)
        embryoDay = parseInt(formData.embryoDay)
        lmpDate = calculateLMPFromImplant(implantDate, embryoDay)
      } else if (activeTab === 'zodiac') {
        if (!formData.targetZodiac || !formData.targetYear || !formData.embryoType) {
          alert('請選擇目標星座、年份和胚胎類型')
          return
        }
        
        // 星座倒推計算
        const zodiacResult = calculateZodiacImplantation(
          formData.targetZodiac, 
          formData.targetYear, 
          formData.embryoType
        )
        
        // 檢查植入日期是否合理
        if (!isImplantationDateReasonable(zodiacResult.implantationRange.start)) {
          const message = zodiacResult.implantationRange.start < new Date() 
            ? '建議的植入時間已過，請選擇下一年度' 
            : '建議的植入時間太遠，請選擇較近的年份'
          alert(message)
          return
        }
        
        setResults({
          ...zodiacResult,
          isZodiacReverse: true
        })
        return
      }

      const currentDate = new Date()
      const pregnancyWeeks = calculatePregnancyWeeks(lmpDate, currentDate)
      const edc = calculateEDCFromLMP(lmpDate)
      const fetalWeight = estimateFetalWeight(pregnancyWeeks.weeks)
      const zodiacSign = calculateZodiacSign(edc)
      const zodiacTraits = getZodiacTraits(zodiacSign)
      const educationInfo = getEducationByWeeks(pregnancyWeeks.weeks)

      setResults({
        lmpDate,
        implantDate,
        embryoDay,
        pregnancyWeeks,
        edc,
        fetalWeight,
        zodiacSign,
        zodiacTraits,
        educationInfo,
        totalWeeks: pregnancyWeeks.weeks,
        totalDays: pregnancyWeeks.weeks * 7 + pregnancyWeeks.days,
        isZodiacReverse: false
      })
    } catch (error) {
      alert('日期格式錯誤，請重新輸入')
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Baby className="h-8 w-8 text-pink-500" />
            <h1 className="text-3xl font-bold text-gray-800">試管嬰兒懷孕計算機</h1>
            <Heart className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-gray-600 text-lg">
            計算預產期、懷孕週數、胎兒體重估值與寶寶星座
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                計算設定
              </CardTitle>
              <CardDescription className="text-pink-100">
                請選擇計算方式並輸入相關日期
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="lmp" className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    最後月經日期
                  </TabsTrigger>
                  <TabsTrigger value="implant" className="flex items-center gap-2">
                    <Baby className="h-4 w-4" />
                    胚胎植入日期
                  </TabsTrigger>
                  <TabsTrigger value="zodiac" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    星座倒推
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="lmp" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lmp-date" className="text-sm font-medium">
                      最後月經第一天 (LMP)
                    </Label>
                    <Input
                      id="lmp-date"
                      type="date"
                      value={formData.lmpDate}
                      onChange={(e) => handleInputChange('lmpDate', e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">
                      適用於自然受孕或試管嬰兒療程
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="implant" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="implant-date" className="text-sm font-medium">
                      胚胎植入日期
                    </Label>
                    <Input
                      id="implant-date"
                      type="date"
                      value={formData.implantDate}
                      onChange={(e) => handleInputChange('implantDate', e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="embryo-day" className="text-sm font-medium">
                      胚胎發育天數
                    </Label>
                    <Select
                      value={formData.embryoDay}
                      onValueChange={(value) => handleInputChange('embryoDay', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選擇胚胎天數" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">第2天胚胎</SelectItem>
                        <SelectItem value="3">第3天胚胎</SelectItem>
                        <SelectItem value="5">第5天囊胚</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      適用於新鮮植入或解凍植入
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="zodiac" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="target-zodiac" className="text-sm font-medium">
                      想要的星座
                    </Label>
                    <Select
                      value={formData.targetZodiac}
                      onValueChange={(value) => handleInputChange('targetZodiac', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選擇目標星座" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ZODIAC_RANGES).map(([key, zodiac]) => (
                          <SelectItem key={key} value={key}>
                            {zodiac.emoji} {zodiac.name} ({zodiac.start[0]}/{zodiac.start[1]} - {zodiac.end[0]}/{zodiac.end[1]})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      選擇您希望寶寶的星座
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="target-year" className="text-sm font-medium">
                      目標年份
                    </Label>
                    <Select
                      value={formData.targetYear.toString()}
                      onValueChange={(value) => handleInputChange('targetYear', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選擇年份" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(3)].map((_, i) => {
                          const year = new Date().getFullYear() + i;
                          return (
                            <SelectItem key={year} value={year.toString()}>
                              {year}年
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      選擇預計生產的年份
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="embryo-type" className="text-sm font-medium">
                      胚胎類型
                    </Label>
                    <Select
                      value={formData.embryoType}
                      onValueChange={(value) => handleInputChange('embryoType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選擇胚胎類型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fresh_day3">新鮮第3天胚胎</SelectItem>
                        <SelectItem value="fresh_day5">新鮮第5天囊胚</SelectItem>
                        <SelectItem value="frozen_day3">冷凍第3天胚胎</SelectItem>
                        <SelectItem value="frozen_day5">冷凍第5天囊胚</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      選擇計劃使用的胚胎類型
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <Button 
                onClick={handleCalculate} 
                className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                開始計算
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          {results && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-teal-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  計算結果
                </CardTitle>
                <CardDescription className="text-blue-100">
                  您的寶寶資訊
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {results.isZodiacReverse ? (
                  // 星座倒推結果顯示
                  <>
                    {/* 目標星座 */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800 mb-2">
                        {results.zodiacEmoji} {results.zodiac}
                      </div>
                      <Badge variant="secondary" className="text-sm">
                        {results.targetYear}年
                      </Badge>
                    </div>

                    <Separator />

                    {/* 星座特質 */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
                      <div className="text-center">
                        <h4 className="font-medium text-gray-800 mb-2">星座特質</h4>
                        <p className="text-sm text-gray-700">
                          {results.zodiacTraits}
                        </p>
                      </div>
                    </div>

                    {/* 建議植入期間 */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Baby className="h-5 w-5 text-pink-500" />
                        <span className="font-medium">建議胚胎植入期間</span>
                      </div>
                      <div className="bg-pink-50 rounded-lg p-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-800 mb-1">
                            {results.implantationRange.startStr} ~ {results.implantationRange.endStr}
                          </div>
                          <Badge variant="outline" className="text-sm border-pink-400 text-pink-700">
                            {getEmbryoTypeName(results.embryoType)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* 預期出生日期範圍 */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">預期出生日期範圍</span>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-800">
                            {results.birthRange.startStr} ~ {results.birthRange.endStr}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 計算詳情 */}
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>推算LMP範圍：{results.lmpRange.startStr} ~ {results.lmpRange.endStr}</div>
                      <div>胚胎類型：{getEmbryoTypeName(results.embryoType)}</div>
                    </div>

                    {/* 重要提醒 */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium mb-1">重要提醒：</p>
                          <ul className="space-y-1 text-xs">
                            <li>• 此計算結果僅供參考，實際植入時間請諮詢專業醫師</li>
                            <li>• 星座只是時間參考，寶寶的健康最重要</li>
                            <li>• 胚胎植入成功率受多種因素影響</li>
                            <li>• 建議在醫師指導下進行療程規劃</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // 原有的正向計算結果顯示
                  <>
                    {/* 懷孕週數 */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800 mb-2">
                        {formatPregnancyWeeks(results.pregnancyWeeks)}
                      </div>
                      <Badge variant="secondary" className="text-sm">
                        總共 {results.totalDays} 天
                      </Badge>
                    </div>

                    <Separator />

                    {/* 預產期 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">預產期 (EDC)</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-800">
                        {formatDate(results.edc)}
                      </span>
                    </div>

                    {/* 胎兒體重 */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Baby className="h-5 w-5 text-pink-500" />
                        <span className="font-medium">胎兒體重估值</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-center">
                          <div className="text-xl font-bold text-gray-800">
                            {results.fetalWeight.average} 公克
                          </div>
                          <div className="text-sm text-gray-600">
                            範圍：{results.fetalWeight.min} - {results.fetalWeight.max} 公克
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 星座 */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">寶寶星座</span>
                      </div>
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4">
                        <div className="text-center mb-2">
                          <Badge variant="outline" className="text-lg px-3 py-1 border-yellow-400 text-yellow-700">
                            {results.zodiacSign}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 text-center">
                          {results.zodiacTraits}
                        </p>
                      </div>
                    </div>

                    {/* 計算詳情 */}
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>計算基準：{formatDate(results.lmpDate)} (LMP)</div>
                      {results.implantDate && (
                        <div>
                          植入日期：{formatDate(results.implantDate)} 
                          ({results.embryoDay}天胚胎)
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Education Section */}
          {results && results.educationInfo && !results.isZodiacReverse && (
            <Card className="lg:col-span-2 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  輔助產檢衛教
                </CardTitle>
                <CardDescription className="text-green-100">
                  {results.educationInfo.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* 產檢項目 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h3 className="font-semibold text-gray-800">本週產檢項目</h3>
                    </div>
                    <div className="space-y-2">
                      {results.educationInfo.checkups.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 衛教重點 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <h3 className="font-semibold text-gray-800">衛教重點</h3>
                    </div>
                    <div className="space-y-2">
                      {results.educationInfo.education.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 小提醒 */}
                {results.educationInfo.tips && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <div className="flex items-start gap-2">
                      <Heart className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-800 mb-1">溫馨提醒</h4>
                        <p className="text-sm text-blue-700">{results.educationInfo.tips}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 通用衛教資訊 */}
                <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(generalEducation).map(([key, section]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-800 mb-2 text-sm">{section.title}</h4>
                      <ul className="space-y-1">
                        {section.items.slice(0, 2).map((item, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></span>
                            <span>{item}</span>
                          </li>
                        ))}
                        {section.items.length > 2 && (
                          <li className="text-xs text-gray-500">
                            ...等 {section.items.length - 2} 項
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm space-y-2">
          <p>* 此計算結果僅供參考，實際情況請諮詢專業醫師</p>
          <p className="text-pink-600 font-medium">阮綜合生殖中心祝你好運旺旺來：）</p>
          <p className="text-xs text-gray-400">yclee & Manus Made</p>
        </div>
      </div>
    </div>
  )
}

export default App

