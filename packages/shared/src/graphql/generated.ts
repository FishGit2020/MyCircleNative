export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  JSON: { input: Record<string, unknown>; output: Record<string, unknown>; }
};

export type AiAction = {
  __typename?: 'AiAction';
  payload?: Maybe<Scalars['JSON']['output']>;
  type: Scalars['String']['output'];
};

export type AiChatHistoryInput = {
  content: Scalars['String']['input'];
  role: Scalars['String']['input'];
};

export type AiChatLogEntry = {
  __typename?: 'AiChatLogEntry';
  answerPreview: Scalars['String']['output'];
  endpointId?: Maybe<Scalars['String']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  fullAnswer?: Maybe<Scalars['String']['output']>;
  fullQuestion?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  inputTokens: Scalars['Int']['output'];
  latencyMs: Scalars['Int']['output'];
  model: Scalars['String']['output'];
  outputTokens: Scalars['Int']['output'];
  provider: Scalars['String']['output'];
  questionPreview: Scalars['String']['output'];
  status: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
  toolCalls: Array<AiToolCallLog>;
};

export type AiChatResponse = {
  __typename?: 'AiChatResponse';
  actions?: Maybe<Array<AiAction>>;
  response: Scalars['String']['output'];
  toolCalls?: Maybe<Array<ToolCallResult>>;
  toolMode?: Maybe<Scalars['String']['output']>;
};

export type AiDailyStats = {
  __typename?: 'AiDailyStats';
  avgLatencyMs: Scalars['Float']['output'];
  calls: Scalars['Int']['output'];
  date: Scalars['String']['output'];
  errors: Scalars['Int']['output'];
  tokens: Scalars['Int']['output'];
};

export type AiToolCallLog = {
  __typename?: 'AiToolCallLog';
  durationMs?: Maybe<Scalars['Int']['output']>;
  error?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type AiUsageSummary = {
  __typename?: 'AiUsageSummary';
  avgLatencyMs: Scalars['Float']['output'];
  dailyBreakdown: Array<AiDailyStats>;
  errorCount: Scalars['Int']['output'];
  errorRate: Scalars['Float']['output'];
  geminiCalls: Scalars['Int']['output'];
  ollamaCalls: Scalars['Int']['output'];
  since: Scalars['String']['output'];
  totalCalls: Scalars['Int']['output'];
  totalInputTokens: Scalars['Int']['output'];
  totalOutputTokens: Scalars['Int']['output'];
};

export type AirQuality = {
  __typename?: 'AirQuality';
  aqi: Scalars['Int']['output'];
  co: Scalars['Float']['output'];
  no: Scalars['Float']['output'];
  no2: Scalars['Float']['output'];
  o3: Scalars['Float']['output'];
  pm2_5: Scalars['Float']['output'];
  pm10: Scalars['Float']['output'];
  so2: Scalars['Float']['output'];
};

export type BabyPhoto = {
  __typename?: 'BabyPhoto';
  caption?: Maybe<Scalars['String']['output']>;
  photoUrl: Scalars['String']['output'];
  stageId: Scalars['Int']['output'];
  uploadedAt: Scalars['String']['output'];
};

export type BenchmarkEndpoint = {
  __typename?: 'BenchmarkEndpoint';
  hasCfAccess: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  source: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type BenchmarkEndpointInput = {
  cfAccessClientId?: InputMaybe<Scalars['String']['input']>;
  cfAccessClientSecret?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  source?: InputMaybe<Scalars['String']['input']>;
  url: Scalars['String']['input'];
};

export type BenchmarkQualityResult = {
  __typename?: 'BenchmarkQualityResult';
  feedback: Scalars['String']['output'];
  judge: Scalars['String']['output'];
  score: Scalars['Float']['output'];
};

export type BenchmarkRun = {
  __typename?: 'BenchmarkRun';
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  results: Array<BenchmarkRunResult>;
  userId: Scalars['String']['output'];
};

export type BenchmarkRunResult = {
  __typename?: 'BenchmarkRunResult';
  endpointId: Scalars['String']['output'];
  endpointName: Scalars['String']['output'];
  error?: Maybe<Scalars['String']['output']>;
  model: Scalars['String']['output'];
  prompt: Scalars['String']['output'];
  qualityFeedback?: Maybe<Scalars['String']['output']>;
  qualityJudge?: Maybe<Scalars['String']['output']>;
  qualityScore?: Maybe<Scalars['Float']['output']>;
  response: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
  timing?: Maybe<BenchmarkTimingResult>;
};

export type BenchmarkSummary = {
  __typename?: 'BenchmarkSummary';
  endpointCount: Scalars['Int']['output'];
  fastestEndpoint?: Maybe<Scalars['String']['output']>;
  fastestTps?: Maybe<Scalars['Float']['output']>;
  lastRunAt?: Maybe<Scalars['String']['output']>;
  lastRunId?: Maybe<Scalars['String']['output']>;
};

export type BenchmarkTimingResult = {
  __typename?: 'BenchmarkTimingResult';
  evalCount: Scalars['Int']['output'];
  evalDuration: Scalars['Float']['output'];
  loadDuration: Scalars['Float']['output'];
  promptEvalCount: Scalars['Int']['output'];
  promptEvalDuration: Scalars['Float']['output'];
  promptTokensPerSecond: Scalars['Float']['output'];
  timeToFirstToken: Scalars['Float']['output'];
  tokensPerSecond: Scalars['Float']['output'];
  totalDuration: Scalars['Float']['output'];
};

export type BiblePassage = {
  __typename?: 'BiblePassage';
  copyright?: Maybe<Scalars['String']['output']>;
  reference: Scalars['String']['output'];
  text: Scalars['String']['output'];
  translation?: Maybe<Scalars['String']['output']>;
  verseCount?: Maybe<Scalars['Int']['output']>;
  verses: Array<BibleVerseItem>;
};

export type BibleVerse = {
  __typename?: 'BibleVerse';
  copyright?: Maybe<Scalars['String']['output']>;
  reference: Scalars['String']['output'];
  text: Scalars['String']['output'];
  translation?: Maybe<Scalars['String']['output']>;
};

export type BibleVerseItem = {
  __typename?: 'BibleVerseItem';
  number: Scalars['Int']['output'];
  text: Scalars['String']['output'];
};

export type BibleVersion = {
  __typename?: 'BibleVersion';
  abbreviation: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type Book = {
  __typename?: 'Book';
  audioError?: Maybe<Scalars['String']['output']>;
  audioProgress: Scalars['Int']['output'];
  audioStatus: Scalars['String']['output'];
  author: Scalars['String']['output'];
  chapterCount: Scalars['Int']['output'];
  coverUrl: Scalars['String']['output'];
  description: Scalars['String']['output'];
  epubUrl: Scalars['String']['output'];
  fileSize: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  language: Scalars['String']['output'];
  title: Scalars['String']['output'];
  totalCharacters: Scalars['Int']['output'];
  uploadedAt: Scalars['String']['output'];
  uploadedBy: BookUploader;
};

export type BookChapter = {
  __typename?: 'BookChapter';
  audioDuration?: Maybe<Scalars['Int']['output']>;
  audioUrl?: Maybe<Scalars['String']['output']>;
  characterCount: Scalars['Int']['output'];
  href: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  index: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type BookConversionProgress = {
  __typename?: 'BookConversionProgress';
  audioError?: Maybe<Scalars['String']['output']>;
  audioProgress: Scalars['Int']['output'];
  audioStatus: Scalars['String']['output'];
  canContinue: Scalars['Boolean']['output'];
};

export type BookUploader = {
  __typename?: 'BookUploader';
  displayName: Scalars['String']['output'];
  uid: Scalars['String']['output'];
};

export type CaseStatus = {
  __typename?: 'CaseStatus';
  checkedAt: Scalars['String']['output'];
  formType: Scalars['String']['output'];
  history?: Maybe<Array<CaseStatusHistory>>;
  modifiedDate?: Maybe<Scalars['String']['output']>;
  receiptNumber: Scalars['String']['output'];
  status: Scalars['String']['output'];
  statusDescription: Scalars['String']['output'];
  submittedDate?: Maybe<Scalars['String']['output']>;
};

export type CaseStatusHistory = {
  __typename?: 'CaseStatusHistory';
  date: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type City = {
  __typename?: 'City';
  country: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lat: Scalars['Float']['output'];
  lon: Scalars['Float']['output'];
  name: Scalars['String']['output'];
  state?: Maybe<Scalars['String']['output']>;
};

export type CloudFile = {
  __typename?: 'CloudFile';
  contentType: Scalars['String']['output'];
  downloadUrl: Scalars['String']['output'];
  fileName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  size: Scalars['Int']['output'];
  storagePath: Scalars['String']['output'];
  uploadedAt: Scalars['String']['output'];
};

export type Clouds = {
  __typename?: 'Clouds';
  all: Scalars['Int']['output'];
};

export type CompanyNews = {
  __typename?: 'CompanyNews';
  category: Scalars['String']['output'];
  datetime: Scalars['Int']['output'];
  headline: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  image?: Maybe<Scalars['String']['output']>;
  related?: Maybe<Scalars['String']['output']>;
  source: Scalars['String']['output'];
  summary: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type CryptoPrice = {
  __typename?: 'CryptoPrice';
  current_price: Scalars['Float']['output'];
  id: Scalars['String']['output'];
  image: Scalars['String']['output'];
  market_cap: Scalars['Float']['output'];
  market_cap_rank?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  price_change_percentage_24h?: Maybe<Scalars['Float']['output']>;
  sparkline_7d?: Maybe<Array<Scalars['Float']['output']>>;
  symbol: Scalars['String']['output'];
  total_volume: Scalars['Float']['output'];
};

export type CurrentWeather = {
  __typename?: 'CurrentWeather';
  clouds: Clouds;
  dt: Scalars['Int']['output'];
  feels_like: Scalars['Float']['output'];
  humidity: Scalars['Int']['output'];
  pressure: Scalars['Int']['output'];
  sunrise?: Maybe<Scalars['Int']['output']>;
  sunset?: Maybe<Scalars['Int']['output']>;
  temp: Scalars['Float']['output'];
  temp_max: Scalars['Float']['output'];
  temp_min: Scalars['Float']['output'];
  timezone: Scalars['Int']['output'];
  visibility?: Maybe<Scalars['Int']['output']>;
  weather: Array<WeatherCondition>;
  wind: Wind;
};

export type ForecastDay = {
  __typename?: 'ForecastDay';
  dt: Scalars['Int']['output'];
  humidity: Scalars['Int']['output'];
  pop: Scalars['Float']['output'];
  temp: Temperature;
  weather: Array<WeatherCondition>;
  wind_speed: Scalars['Float']['output'];
};

export type HistoricalWeatherDay = {
  __typename?: 'HistoricalWeatherDay';
  date: Scalars['String']['output'];
  precipitation: Scalars['Float']['output'];
  temp_max: Scalars['Float']['output'];
  temp_min: Scalars['Float']['output'];
  weather_description: Scalars['String']['output'];
  weather_icon: Scalars['String']['output'];
  wind_speed_max: Scalars['Float']['output'];
};

export type HourlyForecast = {
  __typename?: 'HourlyForecast';
  dt: Scalars['Int']['output'];
  pop: Scalars['Float']['output'];
  temp: Scalars['Float']['output'];
  weather: Array<WeatherCondition>;
  wind_speed: Scalars['Float']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addWorshipSong: WorshipSong;
  aiChat: AiChatResponse;
  deleteBabyPhoto: Scalars['Boolean']['output'];
  deleteBenchmarkEndpoint: Scalars['Boolean']['output'];
  deleteBenchmarkRun: Scalars['Boolean']['output'];
  deleteBook: Scalars['Boolean']['output'];
  deleteFile: Scalars['Boolean']['output'];
  deleteSharedFile: Scalars['Boolean']['output'];
  deleteWorshipSong: Scalars['Boolean']['output'];
  permanentDeleteBook: Scalars['Boolean']['output'];
  restoreBook: Scalars['Boolean']['output'];
  runBenchmark: BenchmarkRunResult;
  saveBenchmarkEndpoint: BenchmarkEndpoint;
  saveBenchmarkRun: BenchmarkRun;
  scoreBenchmarkResponse: BenchmarkQualityResult;
  shareFile: ShareFileResult;
  updateWorshipSong: WorshipSong;
};


export type MutationAddWorshipSongArgs = {
  input: WorshipSongInput;
};


export type MutationAiChatArgs = {
  context?: InputMaybe<Scalars['JSON']['input']>;
  endpointId?: InputMaybe<Scalars['ID']['input']>;
  history?: InputMaybe<Array<AiChatHistoryInput>>;
  message: Scalars['String']['input'];
  model?: InputMaybe<Scalars['String']['input']>;
  toolMode?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteBabyPhotoArgs = {
  stageId: Scalars['Int']['input'];
};


export type MutationDeleteBenchmarkEndpointArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteBenchmarkRunArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteBookArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteFileArgs = {
  fileId: Scalars['ID']['input'];
};


export type MutationDeleteSharedFileArgs = {
  fileId: Scalars['ID']['input'];
};


export type MutationDeleteWorshipSongArgs = {
  id: Scalars['ID']['input'];
};


export type MutationPermanentDeleteBookArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRestoreBookArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRunBenchmarkArgs = {
  endpointId: Scalars['String']['input'];
  model: Scalars['String']['input'];
  prompt: Scalars['String']['input'];
};


export type MutationSaveBenchmarkEndpointArgs = {
  input: BenchmarkEndpointInput;
};


export type MutationSaveBenchmarkRunArgs = {
  results: Scalars['JSON']['input'];
};


export type MutationScoreBenchmarkResponseArgs = {
  judgeEndpointId?: InputMaybe<Scalars['String']['input']>;
  judgeModel?: InputMaybe<Scalars['String']['input']>;
  judgeProvider: Scalars['String']['input'];
  prompt: Scalars['String']['input'];
  response: Scalars['String']['input'];
};


export type MutationShareFileArgs = {
  fileId: Scalars['ID']['input'];
};


export type MutationUpdateWorshipSongArgs = {
  id: Scalars['ID']['input'];
  input: WorshipSongUpdateInput;
};

export type OllamaRunningModel = {
  __typename?: 'OllamaRunningModel';
  expiresAt: Scalars['String']['output'];
  name: Scalars['String']['output'];
  size: Scalars['Float']['output'];
  sizeVram: Scalars['Float']['output'];
};

export type OllamaStatus = {
  __typename?: 'OllamaStatus';
  latencyMs?: Maybe<Scalars['Int']['output']>;
  models: Array<OllamaRunningModel>;
  reachable: Scalars['Boolean']['output'];
};

export type PodcastEpisode = {
  __typename?: 'PodcastEpisode';
  datePublished?: Maybe<Scalars['Int']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  duration?: Maybe<Scalars['Int']['output']>;
  enclosureUrl?: Maybe<Scalars['String']['output']>;
  feedId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type PodcastEpisodesResponse = {
  __typename?: 'PodcastEpisodesResponse';
  count: Scalars['Int']['output'];
  items: Array<PodcastEpisode>;
};

export type PodcastFeed = {
  __typename?: 'PodcastFeed';
  artwork?: Maybe<Scalars['String']['output']>;
  author?: Maybe<Scalars['String']['output']>;
  categories?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  episodeCount?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  language?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type PodcastSearchResponse = {
  __typename?: 'PodcastSearchResponse';
  count: Scalars['Int']['output'];
  feeds: Array<PodcastFeed>;
};

export type PodcastTrendingResponse = {
  __typename?: 'PodcastTrendingResponse';
  count: Scalars['Int']['output'];
  feeds: Array<PodcastFeed>;
};

export type Query = {
  __typename?: 'Query';
  aiRecentLogs: Array<AiChatLogEntry>;
  aiUsageSummary: AiUsageSummary;
  airQuality?: Maybe<AirQuality>;
  babyPhotos: Array<BabyPhoto>;
  benchmarkEndpointModels: Array<Scalars['String']['output']>;
  benchmarkEndpoints: Array<BenchmarkEndpoint>;
  benchmarkHistory: Array<BenchmarkRun>;
  benchmarkSummary: BenchmarkSummary;
  biblePassage: BiblePassage;
  bibleVersions: Array<BibleVersion>;
  bibleVotd: BibleVerse;
  bibleVotdApi: BibleVerse;
  bookChapters: Array<BookChapter>;
  bookConversionProgress: BookConversionProgress;
  books: Array<Book>;
  checkCaseStatus: CaseStatus;
  cloudFiles: Array<CloudFile>;
  companyNews: Array<CompanyNews>;
  cryptoPrices: Array<CryptoPrice>;
  currentWeather: CurrentWeather;
  forecast: Array<ForecastDay>;
  historicalWeather?: Maybe<HistoricalWeatherDay>;
  hourlyForecast: Array<HourlyForecast>;
  ollamaModels: Array<Scalars['String']['output']>;
  ollamaStatus: OllamaStatus;
  podcastEpisodes: PodcastEpisodesResponse;
  podcastFeed?: Maybe<PodcastFeed>;
  reverseGeocode?: Maybe<City>;
  searchCities: Array<City>;
  searchPodcasts: PodcastSearchResponse;
  searchStocks: Array<StockSearchResult>;
  sharedFiles: Array<SharedFile>;
  stockCandles?: Maybe<StockCandle>;
  stockQuote?: Maybe<StockQuote>;
  trendingPodcasts: PodcastTrendingResponse;
  ttsQuota: TtsQuota;
  weather: WeatherData;
  worshipSong?: Maybe<WorshipSong>;
  worshipSongs: Array<WorshipSong>;
};


export type QueryAiRecentLogsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryAiUsageSummaryArgs = {
  days?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryAirQualityArgs = {
  lat: Scalars['Float']['input'];
  lon: Scalars['Float']['input'];
};


export type QueryBenchmarkEndpointModelsArgs = {
  endpointId: Scalars['ID']['input'];
};


export type QueryBenchmarkHistoryArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryBiblePassageArgs = {
  reference: Scalars['String']['input'];
  translation?: InputMaybe<Scalars['String']['input']>;
};


export type QueryBibleVotdArgs = {
  day: Scalars['Int']['input'];
};


export type QueryBibleVotdApiArgs = {
  day: Scalars['Int']['input'];
};


export type QueryBookChaptersArgs = {
  bookId: Scalars['ID']['input'];
};


export type QueryBookConversionProgressArgs = {
  bookId: Scalars['ID']['input'];
};


export type QueryCheckCaseStatusArgs = {
  receiptNumber: Scalars['String']['input'];
};


export type QueryCompanyNewsArgs = {
  from: Scalars['String']['input'];
  symbol: Scalars['String']['input'];
  to: Scalars['String']['input'];
};


export type QueryCryptoPricesArgs = {
  ids: Array<Scalars['String']['input']>;
  vsCurrency?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCurrentWeatherArgs = {
  lat: Scalars['Float']['input'];
  lon: Scalars['Float']['input'];
};


export type QueryForecastArgs = {
  lat: Scalars['Float']['input'];
  lon: Scalars['Float']['input'];
};


export type QueryHistoricalWeatherArgs = {
  date: Scalars['String']['input'];
  lat: Scalars['Float']['input'];
  lon: Scalars['Float']['input'];
};


export type QueryHourlyForecastArgs = {
  lat: Scalars['Float']['input'];
  lon: Scalars['Float']['input'];
};


export type QueryPodcastEpisodesArgs = {
  feedId: Scalars['ID']['input'];
};


export type QueryPodcastFeedArgs = {
  feedId: Scalars['ID']['input'];
};


export type QueryReverseGeocodeArgs = {
  lat: Scalars['Float']['input'];
  lon: Scalars['Float']['input'];
};


export type QuerySearchCitiesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};


export type QuerySearchPodcastsArgs = {
  query: Scalars['String']['input'];
};


export type QuerySearchStocksArgs = {
  query: Scalars['String']['input'];
};


export type QueryStockCandlesArgs = {
  from: Scalars['Int']['input'];
  resolution?: InputMaybe<Scalars['String']['input']>;
  symbol: Scalars['String']['input'];
  to: Scalars['Int']['input'];
};


export type QueryStockQuoteArgs = {
  symbol: Scalars['String']['input'];
};


export type QueryWeatherArgs = {
  lat: Scalars['Float']['input'];
  lon: Scalars['Float']['input'];
};


export type QueryWorshipSongArgs = {
  id: Scalars['ID']['input'];
};

export type ShareFileResult = {
  __typename?: 'ShareFileResult';
  downloadUrl: Scalars['String']['output'];
  ok: Scalars['Boolean']['output'];
};

export type SharedFile = {
  __typename?: 'SharedFile';
  contentType: Scalars['String']['output'];
  downloadUrl: Scalars['String']['output'];
  fileName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  sharedAt: Scalars['String']['output'];
  sharedByName: Scalars['String']['output'];
  sharedByUid: Scalars['String']['output'];
  size: Scalars['Int']['output'];
  storagePath: Scalars['String']['output'];
};

export type StockCandle = {
  __typename?: 'StockCandle';
  c: Array<Scalars['Float']['output']>;
  h: Array<Scalars['Float']['output']>;
  l: Array<Scalars['Float']['output']>;
  o: Array<Scalars['Float']['output']>;
  s: Scalars['String']['output'];
  t: Array<Scalars['Int']['output']>;
  v: Array<Scalars['Int']['output']>;
};

export type StockQuote = {
  __typename?: 'StockQuote';
  c: Scalars['Float']['output'];
  d: Scalars['Float']['output'];
  dp: Scalars['Float']['output'];
  h: Scalars['Float']['output'];
  l: Scalars['Float']['output'];
  o: Scalars['Float']['output'];
  pc: Scalars['Float']['output'];
  t: Scalars['Int']['output'];
};

export type StockSearchResult = {
  __typename?: 'StockSearchResult';
  description: Scalars['String']['output'];
  displaySymbol: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  weatherUpdates: WeatherUpdate;
};


export type SubscriptionWeatherUpdatesArgs = {
  lat: Scalars['Float']['input'];
  lon: Scalars['Float']['input'];
};

export type Temperature = {
  __typename?: 'Temperature';
  day: Scalars['Float']['output'];
  max: Scalars['Float']['output'];
  min: Scalars['Float']['output'];
  night: Scalars['Float']['output'];
};

export type ToolCallResult = {
  __typename?: 'ToolCallResult';
  args?: Maybe<Scalars['JSON']['output']>;
  name: Scalars['String']['output'];
  result?: Maybe<Scalars['String']['output']>;
};

export type TtsQuota = {
  __typename?: 'TtsQuota';
  limit: Scalars['Int']['output'];
  remaining: Scalars['Int']['output'];
  used: Scalars['Int']['output'];
};

export type WeatherCondition = {
  __typename?: 'WeatherCondition';
  description: Scalars['String']['output'];
  icon: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  main: Scalars['String']['output'];
};

export type WeatherData = {
  __typename?: 'WeatherData';
  current?: Maybe<CurrentWeather>;
  forecast?: Maybe<Array<ForecastDay>>;
  hourly?: Maybe<Array<HourlyForecast>>;
};

export type WeatherUpdate = {
  __typename?: 'WeatherUpdate';
  current: CurrentWeather;
  lat: Scalars['Float']['output'];
  lon: Scalars['Float']['output'];
  timestamp: Scalars['String']['output'];
};

export type Wind = {
  __typename?: 'Wind';
  deg: Scalars['Int']['output'];
  gust?: Maybe<Scalars['Float']['output']>;
  speed: Scalars['Float']['output'];
};

export type WorshipSong = {
  __typename?: 'WorshipSong';
  artist: Scalars['String']['output'];
  bpm?: Maybe<Scalars['Int']['output']>;
  content: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  format: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  notes: Scalars['String']['output'];
  originalKey: Scalars['String']['output'];
  tags?: Maybe<Array<Scalars['String']['output']>>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  youtubeUrl?: Maybe<Scalars['String']['output']>;
};

export type WorshipSongInput = {
  artist: Scalars['String']['input'];
  bpm?: InputMaybe<Scalars['Int']['input']>;
  content: Scalars['String']['input'];
  format: Scalars['String']['input'];
  notes: Scalars['String']['input'];
  originalKey: Scalars['String']['input'];
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title: Scalars['String']['input'];
  youtubeUrl?: InputMaybe<Scalars['String']['input']>;
};

export type WorshipSongUpdateInput = {
  artist?: InputMaybe<Scalars['String']['input']>;
  bpm?: InputMaybe<Scalars['Int']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  format?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  originalKey?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
  youtubeUrl?: InputMaybe<Scalars['String']['input']>;
};
