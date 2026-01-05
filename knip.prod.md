
> @nan0web/llimo.app@1.0.0 knip:production
> knip --production

Unused files (95)
bin/llimo-system.js                        
bin/llimo-unpack.js                        
play/alert-demo.js                         
play/cli/testing/progress.js               
play/console-demo.js                       
play/main.js                               
play/progress-demo.js                      
play/table-demo.js                         
play/ui-demo.js                            
play/utils/ReadLine.js                     
scripts/batch-transcribe-api.js            
src/cli/testing/index.js                   
src/cli/testing/TestFileSystem.js          
src/hello/app.js                           
src/llm/ModelFilter.js                     
src/llm/TestRunner.js                      
src/README.md.js                           
src/strategies/fastest.js                  
src/Test/Options.js                        
src/utils/cli.js                           
src/utils/JSONL.js                         
types/Chat/commands/info.d.ts              
types/Chat/commands/release.d.ts           
types/Chat/commands/test.d.ts              
types/Chat/index.d.ts                      
types/Chat/models.d.ts                     
types/Chat/Options.d.ts                    
types/cli/ANSI.d.ts                        
types/cli/App.d.ts                         
types/cli/argvHelper.d.ts                  
types/cli/autocomplete.d.ts                
types/cli/components/Alert.d.ts            
types/cli/components/index.d.ts            
types/cli/components/Progress.d.ts         
types/cli/components/Table.d.ts            
types/cli/index.d.ts                       
types/cli/ModelsOptions.d.ts               
types/cli/runCommand.d.ts                  
types/cli/selectModel.d.ts                 
types/cli/testing/index.d.ts               
types/cli/testing/node.d.ts                
types/cli/testing/progress.d.ts            
types/cli/testing/TestFileSystem.d.ts      
types/cli/Ui.d.ts                          
types/cli/UiOutput.d.ts                    
types/FileProtocol.d.ts                    
types/hello/app.d.ts                       
types/llm/AI.d.ts                          
types/llm/Architecture.d.ts                
types/llm/Chat.d.ts                        
types/llm/chatLoop.d.ts                    
types/llm/chatProgress.d.ts                
types/llm/chatSteps.d.ts                   
types/llm/commands/BashCommand.d.ts        
types/llm/commands/Command.d.ts            
types/llm/commands/GetFilesCommand.d.ts    
types/llm/commands/index.d.ts              
types/llm/commands/ListFilesCommand.d.ts   
types/llm/commands/RemoveCommand.d.ts      
types/llm/commands/SummaryCommand.d.ts     
types/llm/commands/ValidateCommand.d.ts    
types/llm/handleTestMode.d.ts              
types/llm/index.d.ts                       
types/llm/Limits.d.ts                      
types/llm/ModelFilter.d.ts                 
types/llm/ModelInfo.d.ts                   
types/llm/ModelProvider.d.ts               
types/llm/pack.d.ts                        
types/llm/Pricing.d.ts                     
types/llm/ProviderConfig.d.ts              
types/llm/providers/cerebras.info.d.ts     
types/llm/providers/huggingface.info.d.ts  
types/llm/providers/openrouter.info.d.ts   
types/llm/selectModel.d.ts                 
types/llm/system.d.ts                      
types/llm/TestAI.d.ts                      
types/llm/TestRunner.d.ts                  
types/llm/TopProvider.d.ts                 
types/llm/unpack.d.ts                      
types/llm/Usage.d.ts                       
types/release/index.d.ts                   
types/release/ReleaseProtocol.d.ts         
types/strategies/fastest.d.ts              
types/templates/system.d.ts                
types/Test/Options.d.ts                    
types/utils/cli.d.ts                       
types/utils/FileSystem.d.ts                
types/utils/Git.d.ts                       
types/utils/index.d.ts                     
types/utils/JSONL.d.ts                     
types/utils/Markdown.d.ts                  
types/utils/Path.d.ts                      
types/utils/ReadLine.d.ts                  
types/utils/Release.d.ts                   
types/utils/test.d.ts                      
Unused exports (78)
InfoOptions        class     src/Chat/commands/info.js:13:14            
STAGE_DETAILS                src/Chat/commands/release.js:393:10        
STAGE_LABELS                 src/Chat/commands/release.js:393:25        
UNDERLINE                    src/cli/ANSI.js:14:14                      
BLINK                        src/cli/ANSI.js:15:14                      
RAPID_BLINK                  src/cli/ANSI.js:16:14                      
INVERSE                      src/cli/ANSI.js:17:14                      
CONCEAL                      src/cli/ANSI.js:18:14                      
STRIKETHROUGH                src/cli/ANSI.js:19:14                      
BLACK                        src/cli/ANSI.js:22:14                      
BLUE                         src/cli/ANSI.js:26:14                      
WHITE                        src/cli/ANSI.js:29:14                      
BRIGHT_BLACK                 src/cli/ANSI.js:30:14                      
BRIGHT_RED                   src/cli/ANSI.js:31:14                      
BRIGHT_GREEN                 src/cli/ANSI.js:32:14                      
BRIGHT_YELLOW                src/cli/ANSI.js:33:14                      
BRIGHT_BLUE                  src/cli/ANSI.js:34:14                      
BRIGHT_MAGENTA               src/cli/ANSI.js:35:14                      
BRIGHT_CYAN                  src/cli/ANSI.js:36:14                      
BRIGHT_WHITE                 src/cli/ANSI.js:37:14                      
BG_BLACK                     src/cli/ANSI.js:40:14                      
BG_RED                       src/cli/ANSI.js:41:14                      
BG_GREEN                     src/cli/ANSI.js:42:14                      
BG_YELLOW                    src/cli/ANSI.js:43:14                      
BG_BLUE                      src/cli/ANSI.js:44:14                      
BG_MAGENTA                   src/cli/ANSI.js:45:14                      
BG_CYAN                      src/cli/ANSI.js:46:14                      
BG_WHITE                     src/cli/ANSI.js:47:14                      
BG_BRIGHT_BLACK              src/cli/ANSI.js:48:14                      
BG_BRIGHT_RED                src/cli/ANSI.js:49:14                      
BG_BRIGHT_GREEN              src/cli/ANSI.js:50:14                      
BG_BRIGHT_YELLOW             src/cli/ANSI.js:51:14                      
BG_BRIGHT_BLUE               src/cli/ANSI.js:52:14                      
BG_BRIGHT_MAGENTA            src/cli/ANSI.js:53:14                      
BG_BRIGHT_CYAN               src/cli/ANSI.js:54:14                      
BG_BRIGHT_WHITE              src/cli/ANSI.js:55:14                      
COLORS                       src/cli/ANSI.js:58:14                      
BG_COLORS                    src/cli/ANSI.js:63:14                      
CLEAR_LINE                   src/cli/ANSI.js:82:14                      
OVERWRITE_LINE               src/cli/ANSI.js:83:14                      
cursorUp           function  src/cli/ANSI.js:101:17                     
default                      src/cli/App.js:415:8                       
parseIO            function  src/cli/argvHelper.js:29:23                
modelRows          function  src/cli/autocomplete.js:75:17              
formatContext      function  src/cli/autocomplete.js:88:17              
highlightCell      function  src/cli/autocomplete.js:107:17             
parseFieldFilter   function  src/cli/autocomplete.js:119:17             
filterModels       function  src/cli/autocomplete.js:134:17             
renderTable        function  src/cli/autocomplete.js:190:17             
clearLines         function  src/cli/autocomplete.js:230:17             
interactive        function  src/cli/autocomplete.js:240:23             
pipeOutput         function  src/cli/autocomplete.js:355:17             
Progress                     src/cli/components/index.js:3:10           
Progress           class     src/cli/components/Progress.js:7:14        
TableOptions       class     src/cli/components/Table.js:7:14           
runCommand                   src/cli/index.js:3:10                      
ModelsOptions      class     src/cli/ModelsOptions.js:3:14              
Tap                class     src/cli/testing/node.js:18:14              
DeclarationTS      class     src/cli/testing/node.js:196:14             
noDebugger         function  src/cli/testing/progress.js:6:17           
UiFormats          class     src/cli/Ui.js:28:14                        
UiConsole          class     src/cli/Ui.js:114:14                       
UiOutput           class     src/cli/UiOutput.js:1:14                   
AiStrategy         class     src/llm/AI.js:21:14                        
Architecture       class     src/llm/Architecture.js:4:14               
ChatConfig         class     src/llm/Chat.js:9:14                       
renderTests        function  src/llm/chatSteps.js:268:17                
printAnswer        function  src/llm/chatSteps.js:289:23                
TestAI                       src/llm/index.js:18:6                      
ModelProvider                src/llm/index.js:23:2                      
Limits             class     src/llm/Limits.js:1:14                     
CacheConfig        class     src/llm/ModelProvider.js:40:14             
default                      src/llm/ProviderConfig.js:51:8             
makeFlat           function  src/llm/providers/cerebras.info.js:31:17   
getModels          function  src/llm/providers/huggingface.info.js:8:17 
makeFlat           function  src/llm/providers/huggingface.info.js:56:17
makeFlat           function  src/llm/providers/openrouter.info.js:8:17  
Usage              class     src/llm/Usage.js:1:14                      
Duplicate exports (11)
ChatCLiApp|default     src/cli/App.js                
Alert|default          src/cli/components/Alert.js   
Progress|default       src/cli/components/Progress.js
Table|default          src/cli/components/Table.js   
ModelsOptions|default  src/cli/ModelsOptions.js      
Ui|default             src/cli/Ui.js                 
UiOutput|default       src/cli/UiOutput.js           
Architecture|default   src/llm/Architecture.js       
Limits|default         src/llm/Limits.js             
Usage|default          src/llm/Usage.js              
Git|default            src/utils/Git.js              
