/* ===================== BÀI HỌC THEO CHỦ ĐỀ (General English) =====================
 Mỗi bài có 5 phần: Từ vựng · Đọc hiểu · Nghe · Phát âm · Shadowing.
 Thêm bài mới: thêm 1 object vào TOPIC_LESSONS theo đúng mẫu bên dưới.
 Tiến độ lưu trên máy (localStorage 'sstl'). */
const TOPIC_LESSONS=[{
 id:'heavy-heart-a2',level:'A2',title:'Sad but Still Strong',vi:'Buồn nhưng vẫn mạnh mẽ (bản dễ của “Carrying a Heavy Heart”)',
 text:[
  ['Sometimes you feel sad, but you can still go on.','Đôi khi bạn thấy buồn, nhưng bạn vẫn có thể bước tiếp.'],
  ['It is OK to feel sad or tired.','Cảm thấy buồn hay mệt cũng không sao.'],
  ['You can feel sad and still do your work every day.','Bạn có thể buồn mà vẫn làm việc của mình mỗi ngày.'],
  ['Crying does not mean you are weak.','Khóc không có nghĩa là bạn yếu đuối.'],
  ['Sad people can be strong people too.','Người đang buồn cũng có thể là người mạnh mẽ.'],
  ['Think of a bird in the wind.','Hãy nghĩ đến một chú chim trong gió.'],
  ['Flying is hard, but the bird keeps flying.','Bay rất khó, nhưng chú chim vẫn tiếp tục bay.'],
  ['You do not need to wait for a happy day to start again.','Bạn không cần đợi một ngày vui mới bắt đầu lại.'],
  ['Take one small step today.','Hôm nay hãy bước một bước nhỏ.'],
  ['When you keep going on a sad day, you are very brave.','Khi bạn vẫn bước tiếp vào một ngày buồn, bạn rất dũng cảm.']],
 vocab:[
  {en:'sad',ipa:'/sæd/',pos:'adj.',vi:'buồn',ex:'I feel sad today.',exvi:'Hôm nay tôi thấy buồn.'},
  {en:'tired',ipa:'/ˈtaɪəd/',pos:'adj.',vi:'mệt',ex:'She is tired after work.',exvi:'Cô ấy mệt sau giờ làm.'},
  {en:'go on',ipa:'/ɡəʊ ɒn/',pos:'phr. v.',vi:'tiếp tục',ex:'Please go on with your story.',exvi:'Bạn kể tiếp câu chuyện đi.'},
  {en:'keep going',ipa:'/kiːp ˈɡəʊɪŋ/',pos:'v.',vi:'tiếp tục, không dừng lại',ex:'It is hard, but keep going!',exvi:'Khó đấy, nhưng đừng dừng lại!'},
  {en:'weak',ipa:'/wiːk/',pos:'adj.',vi:'yếu',ex:'I felt weak when I was ill.',exvi:'Tôi thấy yếu khi bị ốm.'},
  {en:'strong',ipa:'/strɒŋ/',pos:'adj.',vi:'mạnh mẽ',ex:'You are stronger than you think.',exvi:'Bạn mạnh mẽ hơn bạn nghĩ.'},
  {en:'cry',ipa:'/kraɪ/',pos:'v.',vi:'khóc',ex:'The baby is crying.',exvi:'Em bé đang khóc.'},
  {en:'wind',ipa:'/wɪnd/',pos:'n.',vi:'gió',ex:'The wind is very strong today.',exvi:'Hôm nay gió rất mạnh.'},
  {en:'step',ipa:'/step/',pos:'n.',vi:'bước',ex:'Take one step at a time.',exvi:'Đi từng bước một.'},
  {en:'brave',ipa:'/breɪv/',pos:'adj.',vi:'dũng cảm',ex:'The brave boy helped his friend.',exvi:'Cậu bé dũng cảm đã giúp bạn mình.'}],
 fill:[
  ['I am very ___ after a long day.','tired'],
  ['Don\'t stop. ___!','keep going'],
  ['The baby started to ___.','cry'],
  ['The ___ moved the trees.','wind'],
  ['He saved the cat. He is ___.','brave']],
 tf:[
  ['It is OK to feel tired.',true],
  ['Crying means you are weak.',false],
  ['The bird stops flying in the wind.',false],
  ['You must wait for a happy day to start again.',false]],
 mcq:[
  ['What can you do on a sad day?',['Stop everything','Take one small step','Wait for a happy day'],1],
  ['Why does the text talk about a bird?',['To show that hard things can still be done','To teach about animals','To talk about the weather'],0],
  ['Who is brave in the text?',['People who never cry','People who keep going on a sad day','People who are always happy'],1]],
 discuss:'What do you do to feel better on a sad day? Say 3 sentences.',
 gaps:[[0,'sad'],[1,'tired'],[3,'weak'],[4,'strong'],[5,'wind'],[8,'step'],[9,'brave']],
 gist:['What is the main idea?',['Never feel sad','You can be sad and keep going','Birds like the wind'],1],
 dictation:[1,8],
 sounds:[
  {ipa:'/æ/',tip:'Mở miệng rộng, giữa “a” và “e”.',words:['sad','can','that']},
  {ipa:'/aɪ/',tip:'Âm đôi trượt từ /a/ sang /ɪ/.',words:['tired','cry','fly']},
  {ipa:'/iː/',tip:'Âm “i” dài, kéo môi sang hai bên.',words:['weak','keep','need']},
  {ipa:'/ŋ/',tip:'Âm mũi cuối từ, không bật thêm /g/.',words:['strong','going','flying']},
  {ipa:'/st/',tip:'Hai phụ âm liền nhau, không chèn “ơ” vào giữa (không đọc “sơ-tép”).',words:['step','strong','still']}],
 linking:[['feel sad','/fiːl sæd/'],['go on','/ɡəʊ‿wɒn/'],['keep going','/kiːp ˈɡəʊɪŋ/'],['step today','/step‿təˈdeɪ/']],
 stress:['It is OK to feel SAD or TIRED.','CRYING does NOT mean you are WEAK.','Take ONE SMALL STEP today.'],
 shadow:[0,3,8,9]
},{
 id:'heavy-heart',level:'B1',title:'Carrying a Heavy Heart',vi:'Mang nỗi buồn mà vẫn bước tiếp · từ vựng A2, nghĩa bóng B1',
 text:[
  ['You can carry a heavy heart and still keep moving forward.','Bạn có thể mang nỗi buồn trong lòng mà vẫn tiếp tục bước về phía trước.'],
  ['It is okay to feel sad, tired, or hurt and still show up for your life.','Cảm thấy buồn, mệt hay tổn thương mà vẫn sống trọn cuộc đời mình là điều bình thường.'],
  ['Your pain does not take away your strength, and your tears do not mean you are failing.','Nỗi đau không lấy đi sức mạnh của bạn, và nước mắt không có nghĩa là bạn đang thất bại.'],
  ['Even when your wings feel too heavy to lift, you still have the will to rise.','Ngay cả khi đôi cánh nặng đến mức không nhấc lên nổi, bạn vẫn có ý chí để bay lên.'],
  ['You are still going, even when it feels like you are barely holding on.','Bạn vẫn đang bước tiếp, ngay cả khi cảm thấy mình chỉ vừa đủ sức gắng gượng.'],
  ['Flying does not always feel easy or joyful.','Bay không phải lúc nào cũng dễ dàng hay vui vẻ.'],
  ['Sometimes it means pushing through the wind even when your heart aches.','Đôi khi điều đó có nghĩa là vượt qua cơn gió ngay cả khi trái tim đang đau nhói.'],
  ['You do not have to wait until you feel better to keep going.','Bạn không cần đợi đến khi thấy khá hơn mới tiếp tục.'],
  ['You are strong enough to carry your sadness and still move toward what is ahead.','Bạn đủ mạnh mẽ để mang theo nỗi buồn và vẫn hướng về phía trước.'],
  ['Your ability to keep going, even when you are sad, is the bravest thing you can do.','Khả năng tiếp tục bước đi, ngay cả khi buồn, là điều dũng cảm nhất bạn có thể làm.']],
 vocab:[
  {en:'heavy heart',ipa:'/ˌhevi ˈhɑːt/',pos:'n.',vi:'nỗi buồn nặng trĩu',ex:'She left home with a heavy heart.',exvi:'Cô ấy rời nhà với nỗi buồn nặng trĩu.'},
  {en:'move forward',ipa:'/muːv ˈfɔːwəd/',pos:'v.',vi:'tiến về phía trước, tiếp tục tiến bộ',ex:'After the exam, he decided to move forward.',exvi:'Sau kỳ thi, anh ấy quyết định bước tiếp.'},
  {en:'show up',ipa:'/ʃəʊ ʌp/',pos:'phr. v.',vi:'có mặt, xuất hiện và tham gia',ex:'Show up for your friends when they need you.',exvi:'Hãy có mặt bên bạn bè khi họ cần bạn.'},
  {en:'strength',ipa:'/streŋθ/',pos:'n.',vi:'sức mạnh, nghị lực',ex:'Asking for help takes strength.',exvi:'Nhờ giúp đỡ cũng cần có nghị lực.'},
  {en:'fail',ipa:'/feɪl/',pos:'v.',vi:'thất bại',ex:'Crying does not mean you fail.',exvi:'Khóc không có nghĩa là bạn thất bại.'},
  {en:'wing',ipa:'/wɪŋ/',pos:'n.',vi:'đôi cánh',ex:'The bird spread its wings.',exvi:'Con chim dang rộng đôi cánh.'},
  {en:'rise',ipa:'/raɪz/',pos:'v.',vi:'bay lên, đứng dậy, vươn lên',ex:'The sun will rise tomorrow.',exvi:'Mặt trời sẽ mọc vào ngày mai.'},
  {en:'barely',ipa:'/ˈbeəli/',pos:'adv.',vi:'vừa đủ, hầu như không',ex:'I barely slept last night.',exvi:'Tối qua tôi hầu như không ngủ.'},
  {en:'hold on',ipa:'/həʊld ɒn/',pos:'phr. v.',vi:'gắng gượng, cố giữ vững',ex:'Hold on, things will get better.',exvi:'Cố lên, mọi chuyện sẽ tốt hơn.'},
  {en:'push through',ipa:'/pʊʃ θruː/',pos:'phr. v.',vi:'vượt qua khó khăn',ex:'We pushed through the storm.',exvi:'Chúng tôi đã vượt qua cơn bão.'},
  {en:'ache',ipa:'/eɪk/',pos:'v.',vi:'đau nhức, đau nhói',ex:'My legs ache after the run.',exvi:'Chân tôi đau nhức sau khi chạy.'},
  {en:'brave',ipa:'/breɪv/',pos:'adj.',vi:'dũng cảm',ex:'It was the bravest thing she did.',exvi:'Đó là điều dũng cảm nhất cô ấy từng làm.'}],
 fill:[
  ['I could ___ keep my eyes open.','barely'],
  ['Even when it is hard, try to ___ for your life.','show up'],
  ['She walked in with a ___ heart.','heavy'],
  ['You have to ___ the wind.','push through'],
  ['After falling, he had the will to ___.','rise']],
 tf:[
  ['You must feel better before you keep going.',false],
  ['Tears mean you are failing.',false],
  ['Flying is always easy and joyful.',false],
  ['You can be sad and strong at the same time.',true]],
 mcq:[
  ['What do "wings" represent in the text?',['Your ability to keep going in life','A real bird','A plane journey'],0],
  ['What is "the bravest thing you can do"?',['Hiding your tears','Keeping going even when you are sad','Waiting until you feel better'],1],
  ['Which word is closest to "barely holding on"?',['Easily winning','Almost giving up but still trying','Not trying at all'],1]],
 discuss:'Describe a time you kept going while feeling sad. What helped you?',
 gaps:[ /* [câu nghe, từ cần điền] — câu lấy đúng từ bài */
  [0,'heart'],[0,'forward'],[2,'strength'],[3,'wings'],[3,'rise'],[6,'wind'],[6,'aches']],
 gist:['What is the main idea?',['Sadness makes you weak','You can feel sad and still keep going','You should hide your tears'],1],
 dictation:[7,9],
 sounds:[
  {ipa:'/ɑː/',tip:'Âm “a” dài, mở miệng rộng, không bật “r” mạnh.',words:['heart','are','far']},
  {ipa:'/eɪk/',tip:'“ch” trong ache đọc là /k/, không phải /tʃ/.',words:['ache','aches','headache']},
  {ipa:'/aɪ/',tip:'Âm đôi trượt từ /a/ sang /ɪ/.',words:['rise','tired','fly','cry']},
  {ipa:'/θ/',tip:'Đặt đầu lưỡi giữa hai răng, thổi hơi, không đọc thành /t/ hay /s/.',words:['strength','through','thing']},
  {ipa:'/ŋ/',tip:'Âm mũi cuối từ, không bật thêm /g/.',words:['wings','going','strong']}],
 linking:[['carry a','/ˈkæri‿ə/'],['hold on','/həʊl‿dɒn/'],['keep on','/kiː‿pɒn/'],['push through','/pʊʃ‿θruː/']],
 stress:['Your PAIN does NOT take away your STRENGTH.','You do NOT have to WAIT until you feel BETTER to keep GOING.','You are STILL GOING.'],
 shadow:[0,2,7,9]
},{
 id:'ugly-duckling-a2',level:'A2',title:'The Ugly Duckling',vi:'Chú vịt con xấu xí (phỏng theo truyện của Andersen)',
 text:[
  ['A mother duck had five eggs, and one egg was very big.','Một vịt mẹ có năm quả trứng, và một quả rất to.'],
  ['The last duckling was big, grey and different.','Chú vịt con cuối cùng to, xám và khác các anh chị.'],
  ['The other animals laughed at him every day.','Các con vật khác ngày nào cũng cười nhạo chú.'],
  ['He felt lonely, so he left the farm.','Chú thấy cô đơn nên rời khỏi trang trại.'],
  ['The winter was long, cold and hard.','Mùa đông dài, lạnh và khắc nghiệt.'],
  ['He was hungry, but he did not give up.','Chú đói, nhưng chú không bỏ cuộc.'],
  ['In spring, he saw beautiful white swans on the lake.','Mùa xuân, chú thấy những con thiên nga trắng xinh đẹp trên hồ.'],
  ['He looked into the water and was surprised.','Chú nhìn xuống mặt nước và ngạc nhiên.'],
  ['He was not an ugly duck. He was a swan!','Chú không phải vịt xấu xí. Chú là một con thiên nga!'],
  ['Being different is not bad. Your time will come.','Khác biệt không có gì xấu. Rồi thời của bạn sẽ đến.']],
 vocab:[
  {en:'ugly',ipa:'/ˈʌɡli/',pos:'adj.',vi:'xấu xí',ex:'The old house looks ugly.',exvi:'Ngôi nhà cũ trông xấu xí.'},
  {en:'different',ipa:'/ˈdɪfrənt/',pos:'adj.',vi:'khác biệt',ex:'My idea is different from yours.',exvi:'Ý của tôi khác ý của bạn.'},
  {en:'laugh at',ipa:'/lɑːf æt/',pos:'phr. v.',vi:'cười nhạo',ex:'Please don\'t laugh at me.',exvi:'Làm ơn đừng cười nhạo tôi.'},
  {en:'lonely',ipa:'/ˈləʊnli/',pos:'adj.',vi:'cô đơn',ex:'I feel lonely in a new city.',exvi:'Tôi thấy cô đơn ở thành phố mới.'},
  {en:'hungry',ipa:'/ˈhʌŋɡri/',pos:'adj.',vi:'đói',ex:'I am hungry. Let\'s eat.',exvi:'Tôi đói rồi. Đi ăn thôi.'},
  {en:'give up',ipa:'/ɡɪv ʌp/',pos:'phr. v.',vi:'bỏ cuộc',ex:'Never give up on your dream.',exvi:'Đừng bao giờ từ bỏ ước mơ.'},
  {en:'swan',ipa:'/swɒn/',pos:'n.',vi:'thiên nga',ex:'A swan is swimming on the lake.',exvi:'Một con thiên nga đang bơi trên hồ.'},
  {en:'lake',ipa:'/leɪk/',pos:'n.',vi:'hồ',ex:'We walked around the lake.',exvi:'Chúng tôi đi dạo quanh hồ.'},
  {en:'surprised',ipa:'/səˈpraɪzd/',pos:'adj.',vi:'ngạc nhiên',ex:'She was surprised by the gift.',exvi:'Cô ấy ngạc nhiên vì món quà.'},
  {en:'beautiful',ipa:'/ˈbjuːtɪfl/',pos:'adj.',vi:'xinh đẹp',ex:'What a beautiful day!',exvi:'Hôm nay đẹp trời quá!'}],
 fill:[
  ['I have no friends here. I feel ___.','lonely'],
  ['It is difficult, but don\'t ___!','give up'],
  ['I didn\'t eat lunch. I am ___.','hungry'],
  ['A white ___ swam across the lake.','swan'],
  ['She didn\'t know about the party. She was ___.','surprised']],
 tf:[
  ['The last duckling looked like the others.',false],
  ['The duckling left the farm because he felt lonely.',true],
  ['He gave up in the cold winter.',false],
  ['In the end, he found out he was a swan.',true]],
 mcq:[
  ['Why did the animals laugh at the duckling?',['He was small','He was different','He was a bad swimmer'],1],
  ['What happened in winter?',['He found new friends','He was hungry but kept going','He went back to the farm'],1],
  ['What is the message of the story?',['Being different is bad','Your time will come if you keep going','Swans are better than ducks'],1]],
 discuss:'Have you ever felt different from other people? What helped you? Say 3 sentences.',
 gaps:[[1,'different'],[2,'laughed'],[3,'lonely'],[4,'winter'],[5,'give up'],[6,'swans'],[7,'surprised']],
 gist:['What is the main idea?',['A duck learns to swim','A different bird goes through hard times and finds who he is','Winter is a bad season'],1],
 dictation:[3,9],
 sounds:[
  {ipa:'/ʌ/',tip:'Âm “ă” ngắn, miệng mở vừa, lưỡi thả lỏng.',words:['ugly','hungry','up']},
  {ipa:'/ɒ/',tip:'Âm “o” ngắn, tròn môi, miệng mở.',words:['swan','not','long']},
  {ipa:'/əʊ/',tip:'Âm đôi trượt từ “ơ” sang “u”.',words:['lonely','cold','go']},
  {ipa:'/eɪ/',tip:'Âm đôi trượt từ “e” sang “i”.',words:['lake','came','day']},
  {ipa:'/sw/',tip:'Đọc liền /s/ và /w/, tròn môi ngay khi đọc /s/, không chèn “ơ”.',words:['swan','swim','sweet']}],
 linking:[['give up','/ɡɪv‿ʌp/'],['laughed at','/lɑːft‿æt/'],['looked into','/lʊkt‿ˈɪntuː/'],['was a swan','/wəz‿ə swɒn/']],
 stress:['He was HUNGRY, but he did NOT give UP.','He was NOT an UGLY DUCK.','Your TIME will COME.'],
 shadow:[3,5,8,9]
},{
 id:'last-leaf-b1',level:'B1',title:'The Last Leaf',vi:'Chiếc lá cuối cùng (phỏng theo truyện của O. Henry)',
 text:[
  ['In a small apartment in New York, a young artist named Johnsy fell seriously ill.','Trong một căn hộ nhỏ ở New York, cô hoạ sĩ trẻ Johnsy bị bệnh nặng.'],
  ['She lay in bed and counted the leaves on an old vine outside her window.','Cô nằm trên giường và đếm những chiếc lá trên cây dây leo già ngoài cửa sổ.'],
  ['"When the last leaf falls, I will die too," she told her friend Sue.','“Khi chiếc lá cuối cùng rụng, mình cũng sẽ chết,” cô nói với bạn mình là Sue.'],
  ['The doctor said that her chance of recovery depended on her will to live.','Bác sĩ nói khả năng hồi phục của cô phụ thuộc vào ý chí muốn sống.'],
  ['That night, a terrible storm hit the city with wind and freezing rain.','Đêm đó, một cơn bão khủng khiếp ập vào thành phố với gió và mưa lạnh buốt.'],
  ['In the morning, one leaf was still hanging on the vine.','Sáng hôm sau, vẫn còn một chiếc lá bám trên cây dây leo.'],
  ['Day after day, the leaf survived, and Johnsy slowly began to hope again.','Ngày qua ngày, chiếc lá vẫn trụ lại, và Johnsy dần dần hy vọng trở lại.'],
  ['"I was wrong to give up," she said, and she asked for some soup.','“Mình đã sai khi bỏ cuộc,” cô nói, rồi xin một bát súp.'],
  ['Later, Sue learned that an old painter downstairs had painted the leaf on the wall during the storm.','Sau đó, Sue biết rằng ông hoạ sĩ già ở tầng dưới đã vẽ chiếc lá lên tường trong đêm bão.'],
  ['Sometimes, a small sign of hope is enough to help someone keep fighting.','Đôi khi, một tia hy vọng nhỏ cũng đủ giúp ai đó tiếp tục chiến đấu.']],
 vocab:[
  {en:'seriously ill',ipa:'/ˈsɪəriəsli ɪl/',pos:'adj.',vi:'bệnh nặng',ex:'My grandfather was seriously ill last year.',exvi:'Ông tôi bị bệnh nặng năm ngoái.'},
  {en:'vine',ipa:'/vaɪn/',pos:'n.',vi:'cây dây leo',ex:'A green vine covers the wall.',exvi:'Một cây dây leo xanh phủ kín bức tường.'},
  {en:'recovery',ipa:'/rɪˈkʌvəri/',pos:'n.',vi:'sự hồi phục',ex:'We wish you a quick recovery.',exvi:'Chúc bạn mau hồi phục.'},
  {en:'depend on',ipa:'/dɪˈpend ɒn/',pos:'phr. v.',vi:'phụ thuộc vào',ex:'Our plan depends on the weather.',exvi:'Kế hoạch của chúng ta phụ thuộc vào thời tiết.'},
  {en:'will to live',ipa:'/wɪl tə lɪv/',pos:'n.',vi:'ý chí muốn sống',ex:'His will to live was very strong.',exvi:'Ý chí muốn sống của ông ấy rất mạnh.'},
  {en:'storm',ipa:'/stɔːm/',pos:'n.',vi:'cơn bão',ex:'The storm closed the airport.',exvi:'Cơn bão khiến sân bay phải đóng cửa.'},
  {en:'freezing',ipa:'/ˈfriːzɪŋ/',pos:'adj.',vi:'lạnh buốt',ex:'It is freezing outside.',exvi:'Bên ngoài lạnh buốt.'},
  {en:'survive',ipa:'/səˈvaɪv/',pos:'v.',vi:'sống sót, trụ lại',ex:'Only a few trees survived the fire.',exvi:'Chỉ vài cây sống sót sau vụ cháy.'},
  {en:'hope',ipa:'/həʊp/',pos:'n./v.',vi:'hy vọng',ex:'Don\'t lose hope.',exvi:'Đừng mất hy vọng.'},
  {en:'keep fighting',ipa:'/kiːp ˈfaɪtɪŋ/',pos:'v.',vi:'tiếp tục chiến đấu',ex:'Keep fighting. You can do it.',exvi:'Cứ tiếp tục chiến đấu. Bạn làm được mà.'}],
 fill:[
  ['After the operation, her ___ was fast.','recovery'],
  ['The price ___ the size of the order.','depends on'],
  ['Put on a coat. It\'s ___ today.','freezing'],
  ['The small plant ___ the cold winter.','survived'],
  ['Even in hard times, never lose ___.','hope']],
 tf:[
  ['Johnsy believed she would die when the last leaf fell.',true],
  ['All the leaves fell during the storm.',false],
  ['The doctor said her will to live was important.',true],
  ['Sue painted the leaf on the wall.',false]],
 mcq:[
  ['Why did Johnsy count the leaves?',['She liked drawing them','She connected them with her own life','The doctor asked her to'],1],
  ['What changed Johnsy\'s mind?',['A new medicine','Seeing the last leaf survive','A letter from her family'],1],
  ['Who really saved the last leaf?',['Sue','The doctor','The old painter downstairs'],2]],
 discuss:'What gives you hope when life is difficult? Talk for 30 seconds.',
 gaps:[[0,'seriously ill'],[1,'vine'],[3,'recovery'],[4,'storm'],[4,'freezing'],[6,'survived'],[9,'hope']],
 gist:['What is the main idea?',['Painting is a difficult job','A small sign of hope helps a sick girl fight to live','Storms in New York are dangerous'],1],
 dictation:[5,9],
 sounds:[
  {ipa:'/iː/',tip:'Âm “i” dài, kéo môi sang hai bên.',words:['leaf','freezing','keep']},
  {ipa:'/aɪ/',tip:'Âm đôi trượt từ /a/ sang /ɪ/.',words:['vine','survive','fighting']},
  {ipa:'/ɔː/',tip:'Âm “o” dài, tròn môi, kéo dài hơi.',words:['storm','fall','wall']},
  {ipa:'/v/',tip:'Răng trên chạm nhẹ môi dưới, rung dây thanh; khác với /b/ và /w/.',words:['vine','survive','live']},
  {ipa:'/-ld/',tip:'Âm cuối /l/ + /d/: lưỡi chạm lợi, bật nhẹ /d/, đừng nuốt mất.',words:['old','told','called']}],
 linking:[['fell ill','/fel‿ɪl/'],['depended on','/dɪˈpendɪd‿ɒn/'],['asked for','/ɑːskt fə/'],['sign of hope','/saɪn‿əv həʊp/']],
 stress:['When the LAST LEAF FALLS, I will DIE too.','I was WRONG to GIVE UP.','A SMALL SIGN of HOPE is ENOUGH.'],
 shadow:[2,5,7,9]
},{
 id:'helen-keller-b1',level:'B1',title:'Helen Keller: The Word "Water"',vi:'Helen Keller và chữ “water” (chuyện có thật, phỏng theo hồi ký năm 1903)',
 text:[
  ['When Helen Keller was nineteen months old, a serious illness left her blind and deaf.','Khi Helen Keller được mười chín tháng tuổi, một trận ốm nặng khiến cô bị mù và điếc.'],
  ['She could not see, hear or speak, and she often felt angry and alone.','Cô không nhìn, không nghe, không nói được, và thường thấy giận dữ, cô đơn.'],
  ['When she was almost seven, a young teacher named Anne Sullivan came to live with her family.','Khi gần bảy tuổi, một cô giáo trẻ tên Anne Sullivan đến sống cùng gia đình cô.'],
  ['Anne spelled words into Helen\'s hand with her fingers, but Helen did not understand.','Anne đánh vần chữ vào lòng bàn tay Helen bằng ngón tay, nhưng Helen không hiểu.'],
  ['One day, Anne held Helen\'s hand under cool water from a pump.','Một hôm, Anne đặt tay Helen dưới dòng nước mát từ máy bơm.'],
  ['At the same time, she spelled W-A-T-E-R into her other hand.','Cùng lúc đó, cô đánh vần W-A-T-E-R vào bàn tay còn lại của Helen.'],
  ['Suddenly Helen realized that the word meant the wonderful cool thing on her skin.','Bỗng nhiên Helen nhận ra chữ đó chính là thứ mát lạnh tuyệt vời trên da mình.'],
  ['That day she learned thirty new words, and her world began to open.','Hôm đó cô học được ba mươi từ mới, và thế giới của cô bắt đầu mở ra.'],
  ['With hard work and patience, she later graduated from university and wrote many books.','Nhờ chăm chỉ và kiên nhẫn, sau này cô tốt nghiệp đại học và viết nhiều cuốn sách.'],
  ['Her life shows that a difficult start does not decide how far we can go.','Cuộc đời cô cho thấy khởi đầu khó khăn không quyết định ta có thể đi xa đến đâu.']],
 vocab:[
  {en:'illness',ipa:'/ˈɪlnəs/',pos:'n.',vi:'bệnh, trận ốm',ex:'She missed work because of illness.',exvi:'Cô ấy nghỉ làm vì bị ốm.'},
  {en:'blind',ipa:'/blaɪnd/',pos:'adj.',vi:'mù',ex:'The blind man walked with a dog.',exvi:'Người đàn ông mù đi cùng một chú chó.'},
  {en:'deaf',ipa:'/def/',pos:'adj.',vi:'điếc',ex:'He is deaf, so he uses sign language.',exvi:'Anh ấy bị điếc nên dùng ngôn ngữ ký hiệu.'},
  {en:'spell',ipa:'/spel/',pos:'v.',vi:'đánh vần',ex:'Can you spell your name, please?',exvi:'Bạn đánh vần tên mình được không?'},
  {en:'realize',ipa:'/ˈriːəlaɪz/',pos:'v.',vi:'nhận ra',ex:'I realized I had left my phone at home.',exvi:'Tôi nhận ra mình để quên điện thoại ở nhà.'},
  {en:'wonderful',ipa:'/ˈwʌndəfl/',pos:'adj.',vi:'tuyệt vời',ex:'We had a wonderful trip.',exvi:'Chúng tôi đã có một chuyến đi tuyệt vời.'},
  {en:'patience',ipa:'/ˈpeɪʃns/',pos:'n.',vi:'sự kiên nhẫn',ex:'Learning English needs patience.',exvi:'Học tiếng Anh cần kiên nhẫn.'},
  {en:'graduate',ipa:'/ˈɡrædʒueɪt/',pos:'v.',vi:'tốt nghiệp',ex:'She graduated from university in 2020.',exvi:'Cô ấy tốt nghiệp đại học năm 2020.'},
  {en:'hard work',ipa:'/hɑːd wɜːk/',pos:'n.',vi:'sự chăm chỉ',ex:'Success comes from hard work.',exvi:'Thành công đến từ sự chăm chỉ.'},
  {en:'decide',ipa:'/dɪˈsaɪd/',pos:'v.',vi:'quyết định',ex:'Your past does not decide your future.',exvi:'Quá khứ không quyết định tương lai của bạn.'}],
 fill:[
  ['Could you ___ that word for me?','spell'],
  ['Suddenly I ___ that I was wrong.','realized'],
  ['Teaching children needs a lot of ___.','patience'],
  ['He wants to ___ from university next year.','graduate'],
  ['Thank you for a ___ evening!','wonderful']],
 tf:[
  ['Helen was born blind and deaf.',false],
  ['Anne Sullivan was Helen\'s teacher.',true],
  ['Helen understood the word "water" on the first day Anne arrived.',false],
  ['Helen later graduated from university.',true]],
 mcq:[
  ['How did Anne teach Helen words?',['By drawing pictures','By spelling into her hand','By playing music'],1],
  ['What helped Helen finally understand?',['Feeling water while the word was spelled','A new book','Her parents\' help'],0],
  ['What is the lesson of Helen\'s story?',['Teachers are always right','A difficult start does not decide how far you can go','Water is important for health'],1]],
 discuss:'Who is a person that helped you learn something difficult? What did they do? Talk for 30 seconds.',
 gaps:[[0,'illness'],[0,'blind'],[0,'deaf'],[3,'spelled'],[6,'realized'],[8,'patience'],[8,'graduated']],
 gist:['What is the main idea?',['How to use a water pump','A blind and deaf girl learns language and builds a great life','Why teachers live with families'],1],
 dictation:[4,9],
 sounds:[
  {ipa:'/e/',tip:'Âm “e” ngắn, miệng mở vừa.',words:['deaf','spell','help']},
  {ipa:'/aɪ/',tip:'Âm đôi trượt từ /a/ sang /ɪ/.',words:['blind','realize','decide']},
  {ipa:'/ʃ/',tip:'Tròn môi, đẩy hơi như “suỵt”; khác /s/.',words:['patience','she','shows']},
  {ipa:'/w/',tip:'Tròn môi như “u” rồi mở ra; không chạm răng như /v/.',words:['water','wonderful','world']},
  {ipa:'/-nd/',tip:'Âm cuối /n/ + /d/, bật nhẹ /d/, đừng bỏ.',words:['blind','understand','hand']}],
 linking:[['left her','/left‿hə/'],['came to live','/keɪm tə lɪv/'],['learned thirty','/lɜːnd ˈθɜːti/'],['how far we can go','/haʊ fɑː wi kən ɡəʊ/']],
 stress:['She could NOT SEE, HEAR or SPEAK.','SUDDENLY Helen REALIZED what the WORD meant.','A DIFFICULT START does NOT DECIDE how FAR we can GO.'],
 shadow:[1,6,7,9]
}];

const TL_PARTS=[['vocab','Từ vựng'],['read','Đọc hiểu'],['listen','Nghe'],['pron','Phát âm'],['shadow','Shadowing']];
let TLS={id:null,part:'vocab',a:{}};
const TLP=(()=>{try{return JSON.parse(localStorage.getItem('sstl')||'{}')}catch(e){return{}}})();TLP.done=TLP.done||{};TLP.best=TLP.best||{};
function tlSave(){try{localStorage.setItem('sstl',JSON.stringify(TLP))}catch(e){}}
function tlLesson(){return tlAll().find(x=>x.id==TLS.id)||TOPIC_LESSONS[0]}
function tlDone(id,p){return !!TLP.done[id+':'+p]}
function tlMark(p){const L=tlLesson();if(!TLP.done[L.id+':'+p]){TLP.done[L.id+':'+p]=1;tlSave();S.xp+=20;try{tick()}catch(e){}toast('+20 XP · Xong phần '+TL_PARTS.find(x=>x[0]==p)[1])}save();render()}
function tlOpen(id,p){shReset();SH.on=false;TLS={id,part:p||'vocab',a:{}};S.res=null;go('tl')}
function tlPart(p){shReset();SH.on=false;TLS.part=p;TLS.a={};S.res=null;render();scrollTo(0,0)}
const tlNorm=s=>String(s||'').toLowerCase().replace(/[^a-z' ]/g,' ').replace(/\s+/g,' ').trim();

/* Thẻ hiển thị trên trang Học */
window.TL_SHOWALL=window.TL_SHOWALL||false;window.TL_SHOWDONE=window.TL_SHOWDONE||false;
function vTopicHome(){if(typeof tkSlug=='function'&&tkSlug()=='steel')return '';
 const A=tlAll().filter(x=>String(x.id)[0]!='p'),N=TL_PARTS.length,prog=L=>TL_PARTS.filter(([p])=>tlDone(L.id,p)).length;
 /* đưa bài đang học dở lên đầu, rồi bài chưa học, bài xong xuống cuối */
 const rank=L=>{const n=prog(L);return n>0&&n<N?0:n==0?1:2};const S2=[...A].sort((a,b)=>rank(a)-rank(b));
 const tag=L=>L.mine?(L.shared=='pending'?'⏳ Chờ duyệt':L.shared=='live'?'✓ Đã chia sẻ':'Bài của bạn'):L.author?'Bởi '+esc(L.author):'';
 const card=L=>{const n=prog(L),pc=Math.round(n/N*100);return `<button class="tlc" onclick="tlOpen('${L.id}')" aria-label="${esc(L.title)}, ${n}/${N} phần xong"><span class="tlc-top"><span class="chip">${L.level}</span>${n==N?'<span class="tlc-ok">✓</span>':''}</span><b>${esc(L.title)}</b><small>${esc(L.vi||'')}</small><span class="tlc-bar"><i style="width:${pc}%"></i></span><small class="tlc-m">${n?`${n}/${N} phần`:'Chưa học'}${tag(L)?' · '+tag(L):''}</small></button>`};
 if(!document.getElementById('tlc-css')){const st=document.createElement('style');st.id='tlc-css';st.textContent=`.tlc-row{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding-inline:16px;margin:0 -16px;padding:2px 16px 8px;scrollbar-width:none}.tlc-row::-webkit-scrollbar{display:none}
.tlc{flex:none;width:168px;scroll-snap-align:start;display:flex;flex-direction:column;gap:4px;text-align:left;padding:12px;border-radius:16px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;cursor:pointer}
.tlc b{font:700 .95rem/1.25 var(--fd);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.5em}
.tlc small{color:var(--mut);font-size:.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tlc-top{display:flex;justify-content:space-between;align-items:center}.tlc-top .chip{font-size:.72rem;padding:2px 8px;min-height:0}
.tlc-ok{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:var(--good);color:#fff;font-size:.75rem;font-weight:800}
.tlc-bar{height:6px;border-radius:99px;background:var(--soft);overflow:hidden;margin-top:4px}.tlc-bar i{display:block;height:100%;border-radius:inherit;background:var(--steel)}
.tlc-new{justify-content:center;align-items:center;text-align:center;border-style:dashed;color:var(--steel)}.tlc-new b{min-height:0;font-size:.9rem}
.tl-all .tlc{width:auto}.tl-all{display:grid;grid-template-columns:1fr 1fr;gap:10px}`;document.head.appendChild(st)}
 const all=window.TL_SHOWALL;const doneL=S2.filter(L=>prog(L)==N);const showDone=window.TL_SHOWDONE;const vis=showDone?S2:S2.filter(L=>prog(L)<N);
 return `<div class="sec-h"><h2>Bài học theo chủ đề</h2><button class="link" onclick="TL_SHOWALL=!TL_SHOWALL;render()">${all?'Thu gọn':`Tất cả ${A.length} ›`}</button></div>
 <div class="${all?'tl-all':'tlc-row'}">${(all?vis:vis.slice(0,8)).map(card).join('')}${doneL.length?`<button class="tlc tlc-new" onclick="TL_SHOWDONE=!TL_SHOWDONE;render()"><span style="font-size:1.3rem">${showDone?'🙈':'✓'}</span><b>${showDone?'Ẩn bài đã xong':'Đã xong '+doneL.length+' bài'}</b><small>${showDone?'':'Chạm để xem lại'}</small></button>`:''}<button class="tlc tlc-new" onclick="TLN.msg='';TLS={id:'__new',part:'vocab',a:{}};go('tl')"><span style="font-size:1.6rem">＋</span><b>Tạo bài từ truyện ngắn</b></button></div>`}

function vTopic(){if(TLS.id=='__new')return vStoryForm();const L=tlLesson();if(typeof CATS!='undefined'&&!CATS.tl)CATS.tl={n:'Bài học chủ đề'};
 const tabs=`<div class="chips" style="margin:10px 0;flex-wrap:nowrap;overflow-x:auto">${TL_PARTS.map(([p,n])=>`<button class="chip ${TLS.part==p?'on':''}" onclick="tlPart('${p}')">${tlDone(L.id,p)?'✓ ':''}${n}</button>`).join('')}</div>`;
 const head=`<div class="row" style="justify-content:space-between"><button class="link" onclick="go('home')">‹ Trang Học</button>${L.mine?`<span>${!L.shared||L.shared=='private'||L.shared=='rejected'?`<button class="link" onclick="tlShare('${L.id}')">${PROF?.is_admin?'↗ Đăng cho cả khóa':'↗ Chia sẻ cho khóa'}</button> · `:''}<button class="link" onclick="tlDel('${L.id}')">Xóa</button></span>`:''}${typeof PROF!='undefined'&&PROF?.is_admin&&L.sid&&(L.status=='live'||L.shared=='live')?`<button class="link" style="color:var(--bad)" onclick="tlUnpub(${L.sid})">⊘ Gỡ khỏi khóa</button>`:''}</div><h1 style="margin-top:6px">${esc(L.title)}</h1><p class="mut">${esc(L.vi)} · General English ${L.level}</p>${tabs}`;
 const body={vocab:tlVocab,read:tlRead,listen:tlListen,pron:tlPron,shadow:tlShadow}[TLS.part](L);
 const i=TL_PARTS.findIndex(x=>x[0]==TLS.part);
 const foot=`<div class="row" style="flex-wrap:nowrap;margin-top:16px">${i>0?`<button class="btn ghost" style="flex:1" onclick="tlPart('${TL_PARTS[i-1][0]}')">‹ ${TL_PARTS[i-1][1]}</button>`:''}${i<TL_PARTS.length-1?`<button class="btn" style="flex:1" onclick="tlPart('${TL_PARTS[i+1][0]}')">${TL_PARTS[i+1][1]} ›</button>`:`<button class="btn" style="flex:1" onclick="go('home')">Hoàn thành bài</button>`}</div>`;
 return head+body+foot}

/* ---- Bài tập chọn đáp án dùng chung ---- */
function tlChoice(key,opts,right){const a=TLS.a[key];return `<div class="stack" style="margin-top:8px">${opts.map((o,k)=>`<button class="opt ${a!=null?(k===right?'ok':k===a?'no':''):''}" ${a!=null?'disabled':''} onclick="TLS.a['${key}']=${k};render()">${esc(o)}</button>`).join('')}</div>`}
function tlScore(keys,rights){const got=keys.filter((k,i)=>TLS.a[k]===rights[i]).length;return {got,all:keys.length,done:keys.every(k=>TLS.a[k]!=null)}}
function tlResult(s,part){if(!s.done)return '';const pass=!s.all||s.got/s.all>=.7;return `<div class="card" style="margin-top:12px"><b>${s.got}/${s.all} câu đúng</b> · <span class="${pass?'good':'bad'}">${pass?'Đạt':'Cần đúng 70% để qua'}</span>${pass&&!tlDone(tlLesson().id,part)?`<button class="btn" style="width:100%;margin-top:8px" onclick="tlMark('${part}')">Hoàn thành phần này (+20 XP)</button>`:''}${!pass?`<button class="btn ghost" style="width:100%;margin-top:8px" onclick="TLS.a={};render()">Làm lại</button>`:''}</div>`}

/* ---- 1. Từ vựng ---- */
function tlTerms(L){return L.vocab.map(v=>({en:v.en,vi:v.vi,ex:v.ex,exvi:v.exvi,cat:'tl'}))}
function tlVocab(L){
 const cards=L.vocab.map(v=>`<div class="card"><div class="row" style="justify-content:space-between;flex-wrap:nowrap;align-items:flex-start"><div style="flex:1;min-width:0"><b style="font-size:1.1rem">${esc(v.en)}</b> <span class="mut" style="font-size:.84rem">${esc(v.pos)} ${esc(v.ipa)}</span><div>${esc(v.vi)}</div><i style="font-size:.9rem">${esc(v.ex)}</i><div class="mut" style="font-size:.82rem">${esc(v.exvi)}</div></div><div class="row" style="flex-wrap:nowrap">${spk(v.en)}${slow(v.ex)}</div></div></div>`).join('');
 const opts=[...new Set(L.fill.map(f=>f[1]))];
 const fill=L.fill.map(([q,a],k)=>{const key='f'+k,ans=TLS.a[key];return `<div class="card"><div>${k+1}. ${esc(q).replace('___','<b>____</b>')}</div><div class="row" style="gap:6px;margin-top:6px">${opts.map(o=>`<button class="chip ${ans!=null?(o==a?'on':o==ans?'bad':''):''}" ${ans!=null?'disabled':''} onclick="TLS.a['${key}']='${o}';render()">${esc(o)}</button>`).join('')}</div>${ans!=null&&ans!=a?`<div class="mut" style="font-size:.84rem;margin-top:4px">Đáp án: <b>${esc(a)}</b></div>`:''}</div>`}).join('');
 const s=tlScore(L.fill.map((_,k)=>'f'+k),L.fill.map(f=>f[1]));
 return `<p class="mut">Nghe, đọc nghĩa và ví dụ của ${L.vocab.length} từ trong bài.</p>
 <div class="row" style="flex-wrap:nowrap;margin:8px 0"><button class="btn ghost" style="flex:1" onclick="start({name:'${esc(L.title)} · Từ vựng',mode:'flash',terms:tlTerms(tlLesson()),src:'${esc(L.title)}'})">Flashcard</button><button class="btn ghost" style="flex:1" onclick="start({name:'${esc(L.title)} · Từ vựng',mode:'quiz',terms:tlTerms(tlLesson()),src:'${esc(L.title)}'})">Trắc nghiệm</button></div>
 <div class="stack">${cards}</div><div class="sec-h"><h2>Điền từ</h2></div><div class="stack">${fill}</div>${tlResult(s,'vocab')}`}

/* ---- 2. Đọc hiểu ---- */
function tlRead(L){const show=TLS.a.vi;
 const text=`<div class="card"><div class="row" style="justify-content:space-between"><div class="lbl">Bài đọc · chạm câu để nghe</div><button class="link" onclick="TLS.a.vi=!TLS.a.vi;render()">${show?'Ẩn':'Hiện'} bản dịch</button></div>${L.text.map(([en,vi])=>`<p style="margin:6px 0;cursor:pointer" onclick="say(${esc(JSON.stringify(en))})">${esc(en)}${show?`<br><span class="mut" style="font-size:.86rem">${esc(vi)}</span>`:''}</p>`).join('')}</div>`;
 const tf=L.tf.map(([q,r],k)=>{const key='t'+k;return `<div class="card"><div>${k+1}. ${esc(q)}</div>${tlChoice(key,['True','False'],r?0:1)}</div>`}).join('');
 const mc=L.mcq.map(([q,o,r],k)=>`<div class="card"><div>${k+1}. ${esc(q)}</div>${tlChoice('m'+k,o,r)}</div>`).join('');
 const keys=[...L.tf.map((_,k)=>'t'+k),...L.mcq.map((_,k)=>'m'+k)],rights=[...L.tf.map(x=>x[1]?0:1),...L.mcq.map(x=>x[2])];
 return `${text}<div class="sec-h"><h2>Đúng hay sai?</h2></div><div class="stack">${tf}</div><div class="sec-h"><h2>Hiểu bài</h2></div><div class="stack">${mc}</div>${tlResult(tlScore(keys,rights),'read')}
 <div class="card" style="margin-top:12px"><div class="lbl">Thảo luận</div><b>${esc(L.discuss)}</b><p class="mut" style="font-size:.84rem">Nói hoặc viết 3–5 câu trả lời, dùng ít nhất 3 từ mới.</p></div>`}

/* ---- 3. Nghe ---- */
function tlListen(L){const all=L.text.map(x=>x[0]).join(' ');
 const play=`<div class="card flash" style="min-height:120px"><div class="mut">Nghe cả bài, rồi làm bài tập bên dưới</div><div class="row" style="justify-content:center;gap:10px"><button class="btn" onclick="say(${esc(JSON.stringify(all))})">▶ Tốc độ thường</button><button class="btn ghost" onclick="say(${esc(JSON.stringify(all))},0.7)">▶ Chậm</button></div></div>`;
 const gaps=L.gaps.map(([si,w],k)=>{const sent=L.text[si][0];const re=new RegExp('\\b'+w+'\\b');const q=sent.replace(re,'_____');const key='g'+k,v=TLS.a[key],chk=TLS.a.gchk;const ok=chk&&tlNorm(v)==w;
  return `<div class="card"><div class="row" style="flex-wrap:nowrap;align-items:flex-start"><div style="flex:1;min-width:0">${k+1}. ${esc(q)}</div>${spk(sent)}</div><input type="text" autocomplete="off" autocapitalize="off" value="${esc(v||'')}" oninput="TLS.a['${key}']=this.value" placeholder="Từ còn thiếu" style="margin-top:6px;${chk?`border-color:var(${ok?'--good':'--bad'})`:''}" ${chk?'disabled':''}>${chk&&!ok?`<div class="mut" style="font-size:.84rem">Đáp án: <b>${esc(w)}</b></div>`:''}</div>`}).join('');
 const gs=L.gaps.filter(([,w],k)=>tlNorm(TLS.a['g'+k])==w).length;
 const [gq,go2,gr]=L.gist;
 const dict=L.dictation.map((si,k)=>{const key='d'+k,v=TLS.a[key],chk=TLS.a['dc'+k];const tgt=L.text[si][0];let res='';
  if(chk){const T=tlNorm(tgt).split(' '),H=tlNorm(v).split(' ');const hit=T.filter(w=>H.includes(w)).length;res=`<div style="margin-top:6px">${T.map(w=>`<span class="${H.includes(w)?'good':'bad'}">${esc(w)}</span>`).join(' ')}</div><div class="mut" style="font-size:.84rem">${Math.round(hit/T.length*100)}% từ đúng</div>`}
  return `<div class="card"><div class="row" style="flex-wrap:nowrap"><div style="flex:1">Câu ${k+1}: nghe và chép lại</div>${spk(tgt)}${slow(tgt)}</div><textarea rows="2" oninput="TLS.a['${key}']=this.value" style="width:100%;margin-top:6px" ${chk?'disabled':''}>${esc(v||'')}</textarea>${chk?res:`<button class="btn ghost" style="width:100%;margin-top:6px" onclick="TLS.a['dc${k}']=1;render()">Kiểm tra</button>`}</div>`}).join('');
 const passed=(!L.gaps.length||TLS.a.gchk&&gs/L.gaps.length>=.7)&&TLS.a.gist===gr;
 return `${play}<div class="sec-h"><h2>Điền từ còn thiếu</h2></div><div class="stack">${gaps}</div>
 ${TLS.a.gchk?`<div class="card" style="margin-top:10px"><b>${gs}/${L.gaps.length} từ đúng</b> <button class="link" onclick="TLS.a.gchk=0;render()">Sửa lại</button></div>`:`<button class="btn" style="width:100%;margin-top:10px" onclick="TLS.a.gchk=1;render()">Kiểm tra</button>`}
 <div class="sec-h"><h2>Ý chính</h2></div><div class="card"><div>${esc(gq)}</div>${tlChoice('gist',go2,gr)}</div>
 <div class="sec-h"><h2>Chép chính tả</h2></div><div class="stack">${dict}</div>
 ${passed&&!tlDone(L.id,'listen')?`<button class="btn" style="width:100%;margin-top:12px" onclick="tlMark('listen')">Hoàn thành phần này (+20 XP)</button>`:''}`}

/* ---- 4. Phát âm ---- */
function tlSpeak(i){const L=tlLesson();const s=L.text[i];S.speakItem={en:s[0],vi:s[1],ex:s[0],exvi:s[1],cat:'tl'};S.spMode='sent';TLS.a.sh=i;S.res=null;render();setTimeout(()=>{const m=document.getElementById('micb');m&&m.scrollIntoView({block:'center'})},60)}
function tlShadow(L){SH.on=true;return vShadow(L)}
function tlPron(L){
 const snd=L.sounds.map(x=>`<div class="card"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><b style="font-size:1.2rem">${esc(x.ipa)}</b></div><div class="mut" style="font-size:.86rem">${esc(x.tip)}</div><div class="row" style="gap:6px;margin-top:6px">${x.words.map(w=>`<button class="chip" onclick="say(${esc(JSON.stringify(w))},0.8)">🔊 ${esc(w)}</button>`).join('')}</div></div>`).join('');
 const link=`<div class="card">${L.linking.map(([a,b])=>`<div class="row" style="justify-content:space-between;flex-wrap:nowrap"><span><b>${esc(a.replace(' ','‿'))}</b> <span class="mut">${esc(b)}</span></span>${spk(a)}</div>`).join('')}</div>`;
 const st=`<div class="card">${L.stress.map(s=>`<div class="row" style="justify-content:space-between;flex-wrap:nowrap;align-items:flex-start"><div style="flex:1;min-width:0">${esc(s).replace(/\b([A-Z]{2,})\b/g,'<b style="color:var(--amber,#d97706)">$1</b>').replace(/\b([A-Z]{2,})\b/g,m=>m)}</div>${spk(s.toLowerCase().replace(/^./,c=>c.toUpperCase()))}</div>`).join('')}<p class="mut" style="font-size:.84rem;margin-top:6px">Từ in đậm đọc mạnh và dài hơn. Câu khích lệ dùng ngữ điệu xuống ↘ ở cuối.</p></div>`;
 const cur=TLS.a.sh;
 if(cur!=null&&S.res&&S.res.score!=null){const k=L.id+':'+cur;if(S.res.score>(TLP.best[k]||0)){TLP.best[k]=S.res.score;tlSave()}}
 const sh=L.shadow.map(i=>{const best=TLP.best[L.id+':'+i];return `<div class="card" style="${cur===i?'border:2px solid var(--steel)':''}"><div class="row" style="flex-wrap:nowrap;align-items:flex-start"><div style="flex:1;min-width:0"><b>${esc(L.text[i][0])}</b><div class="mut" style="font-size:.84rem">${esc(L.text[i][1])}</div></div>${spk(L.text[i][0])}${slow(L.text[i][0])}</div><div class="row" style="justify-content:space-between"><span class="mut" style="font-size:.84rem">${best!=null?'Điểm cao nhất: <b class="'+(best>=70?'good':'bad')+'">'+best+'</b>':'Chưa đọc'}</span><button class="btn ghost" onclick="tlSpeak(${i})">${cur===i?'Đang luyện':'🎤 Đọc câu này'}</button></div>${cur===i?`<button class="mic" id="micb" aria-label="Bắt đầu ghi âm" onclick="listen()">${svg('mic')}</button><p class="mut" style="text-align:center;font-size:.84rem" id="mst">Chạm mic, đọc to câu trên</p>${S.res?vRes(S.res):''}`:''}</div>`}).join('');
 const ok=L.shadow.filter(i=>(TLP.best[L.id+':'+i]||0)>=70).length;
 return `<div class="sec-h"><h2>Âm trọng tâm</h2></div><div class="stack">${snd}</div>
 <div class="sec-h"><h2>Nối âm</h2></div>${link}<div class="sec-h"><h2>Trọng âm câu</h2></div>${st}
 <div class="sec-h"><h2>Đọc nhại & chấm điểm AI</h2><span class="mut">${ok}/${L.shadow.length} câu ≥ 70</span></div><div class="stack">${sh}</div>
 ${ok>=Math.ceil(L.shadow.length*.75)&&!tlDone(L.id,'pron')?`<button class="btn" style="width:100%;margin-top:12px" onclick="tlMark('pron')">Hoàn thành phần này (+20 XP)</button>`:''}`}

/* ===================== SHADOWING CẢ BÀI =====================
 Hiện toàn bộ bài. Có thể nghe AI đọc trước (tô sáng từng câu đang đọc).
 Khi đọc: ghi âm liên tục, app tô sáng câu hiện tại, người học đọc xong chạm “Câu tiếp”.
 Đọc hết bài → gửi cả bản ghi cho AI (task 'pron', target = cả bài) → điểm tổng + điểm từng câu. */
const SH_VIEW=[['full','Đủ chữ'],['hint','Chữ gợi ý'],['hide','Chỉ câu đang đọc']];
let SH={on:false,i:-1,view:'full',rate:0.9,mode:'idle',stop:false,rec:null,stream:null,parts:[],url:null,res:null,err:''};
function shUtter(t,rate){return new Promise(res=>{if(!('speechSynthesis' in window))return res();try{if(typeof VOICE!='undefined'&&!VOICE&&typeof pickVoice=='function')pickVoice()}catch(e){}
 const u=new SpeechSynthesisUtterance(t);u.lang='en-US';try{if(VOICE)u.voice=VOICE}catch(e){}u.rate=rate;let ok=false;const fin=()=>{if(!ok){ok=true;res()}};u.onend=fin;u.onerror=fin;setTimeout(fin,1500+t.length*110/rate);speechSynthesis.speak(u)})}
const shWait=ms=>new Promise(r=>setTimeout(r,ms));
function shMask(s){return s.split(' ').map(w=>w.replace(/^([A-Za-z])([A-Za-z']*)/,(m,a,b)=>a+b.replace(/[A-Za-z']/g,'_'))).join(' ')}
const shSents=L=>L.text.map(x=>x[0]);
function shOpen(){shReset();SH.on=true;render();scrollTo(0,0)}
function shDrop(){if(SH.url){try{URL.revokeObjectURL(SH.url)}catch(e){}}SH.url=null}
function shKill(){SH.stop=true;try{speechSynthesis.cancel()}catch(e){}try{SH.rec&&SH.rec.state!='inactive'&&(SH.rec.onstop=null,SH.rec.stop())}catch(e){}try{SH.stream&&SH.stream.getTracks().forEach(t=>t.stop())}catch(e){}SH.rec=null;SH.stream=null}
function shReset(){shKill();shDrop();Object.assign(SH,{i:-1,mode:'idle',res:null,err:'',parts:[]})}
function shExit(){shReset();SH.on=false;render()}
function shFocus(){setTimeout(()=>{const e=document.getElementById('shs'+SH.i);e&&e.scrollIntoView({block:'center',behavior:'smooth'})},40)}
/* Nghe AI đọc cả bài, tô sáng câu đang đọc */
async function shListen(){if(SH.mode=='listen'){shKill();SH.mode='idle';SH.i=-1;render();return}
 if(SH.mode!='idle'&&SH.mode!='done')return;const L=tlLesson(),ss=shSents(L);SH.stop=false;SH.mode='listen';SH.res=null;
 for(let k=0;k<ss.length&&!SH.stop;k++){SH.i=k;render();shFocus();await shUtter(ss[k],SH.rate);await shWait(350)}
 if(!SH.stop){SH.mode='idle';SH.i=-1;render()}}
/* Bắt đầu đọc cả bài: ghi âm liên tục */
async function shStart(){const L=tlLesson();if(SH.mode=='listen')shKill();shDrop();SH.res=null;SH.err='';SH.stop=false;
 if(!navigator.mediaDevices||!window.MediaRecorder){SH.err='Trình duyệt này không ghi âm được. Hãy dùng Safari (iPhone) hoặc Chrome.';render();return}
 let stream;try{stream=typeof micGet=='function'?await micGet():await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){SH.err='Chưa được dùng micro ('+(e.name||'lỗi')+').';render();try{window.MIC&&MIC.open()}catch(x){}return}
 const mt=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(x=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(x))||'';
 const mr=new MediaRecorder(stream,mt?{mimeType:mt}:{});SH.parts=[];mr.ondataavailable=e=>e.data.size&&SH.parts.push(e.data);
 SH.rec=mr;SH.stream=stream;SH.mime=mr.mimeType||mt||'audio/mp4';mr.start();SH.mode='rec';SH.i=0;SH.t0=Date.now();render();shFocus();
 clearTimeout(SH.lim);SH.lim=setTimeout(()=>{if(SH.mode=='rec'){toast('Đã đủ 3 phút, AI chấm phần đã đọc');shFinish()}},180000)}
function shNextSent(){const L=tlLesson();if(SH.mode!='rec')return;if(SH.i<L.text.length-1){SH.i++;render();shFocus()}else shFinish()}
function shPrevSent(){if(SH.mode=='rec'&&SH.i>0){SH.i--;render();shFocus()}}
async function shReplaySent(){if(SH.mode!='rec'||SH.i<0)return;const L=tlLesson();try{SH.rec.pause()}catch(e){}await shUtter(L.text[SH.i][0],SH.rate);try{SH.rec.resume()}catch(e){}}
async function shFinish(){const L=tlLesson(),mr=SH.rec;if(!mr)return;clearTimeout(SH.lim);const upto=SH.i;
 await new Promise(r=>{mr.onstop=r;try{mr.stop()}catch(e){r()}});try{SH.stream.getTracks().forEach(t=>t.stop())}catch(e){}SH.rec=null;SH.stream=null;
 const blob=new Blob(SH.parts,{type:SH.mime});SH.url=URL.createObjectURL(blob);SH.mode='grade';SH.i=-1;render();
 if(blob.size<3000){SH.mode='done';SH.err='Bản ghi quá ngắn. Hãy đọc to rồi thử lại.';render();return}
 const ss=shSents(L).slice(0,upto+1),target=ss.join(' ');
 try{const b64=await new Promise((ok,no)=>{const fr=new FileReader();fr.onload=()=>ok(String(fr.result).split(',')[1]);fr.onerror=no;fr.readAsDataURL(blob)});
  const r=await ai('pron',{audio:b64,mime:SH.mime.split(';')[0],target});if(r.error)throw new Error(r.error);
  const heard=String(r.heard||'').trim();if(!/[a-z]/i.test(heard))throw new Error('AI chưa nghe rõ giọng bạn. Đọc to và gần máy hơn.');
  const g=gradeSpeech(target,heard,.9,false);if(r.tip)g.aiTip=r.tip;
  let k=0;g.per=ss.map(s=>{const n=norm(s).length,ws=g.words.slice(k,k+n);k+=n;return{ws,score:ws.length?Math.round(ws.reduce((a,w)=>a+w.v,0)/ws.length*100):0}});
  g.partial=upto<L.text.length-1;SH.res=g;
  if(g.score>=70){try{dispatchEvent(new Event('ss-shadow-done'))}catch(e){}if(!tlDone(L.id,'shadow'))tlMark('shadow');else toast('Hoàn thành shadowing cả bài!')}
  try{tick();save()}catch(e){}}
 catch(e){SH.err=e&&e.code=='login'?'Cần đăng nhập để AI chấm cả bài.':'Chưa chấm được: '+(e.message||e)}
 SH.mode='done';render();setTimeout(()=>{const e=document.getElementById('shres');e&&e.scrollIntoView({block:'start',behavior:'smooth'})},60)}
async function shCompare(i){const L=tlLesson();await shUtter(L.text[i][0],SH.rate)}
function shSentHTML(L,k){const [en,vi]=L.text[k],cur=SH.i===k,res=SH.res&&SH.res.per&&SH.res.per[k];
 let body;if(res){body=res.ws.map(w=>`<span class="w ${w.s}">${esc(w.w)}</span>`).join(' ')}
 else{const v=SH.view,txt=v=='full'||(cur&&SH.mode=='listen')?en:v=='hint'||cur?shMask(en):'• • •';body=esc(txt)}
 const st=cur?'background:color-mix(in srgb,var(--steel) 22%,transparent);border-left:4px solid var(--steel);opacity:1':SH.mode=='rec'||SH.mode=='listen'?'border-left:4px solid transparent;opacity:'+(k<SH.i?'.45':'.7'):'border-left:4px solid transparent';
 return `<div id="shs${k}" style="padding:8px 10px;border-radius:10px;transition:all .2s;${st}" ${SH.mode=='idle'||SH.mode=='done'?`onclick="shCompare(${k})"`:''}><div style="font-size:${cur?'1.12rem':'1rem'};font-weight:${cur?700:500};line-height:1.5;letter-spacing:${SH.view=='hint'&&!res?'.03em':'0'}">${body}</div>${res?`<div class="mut" style="font-size:.78rem">Câu ${k+1}: <b class="${res.score>=80?'good':res.score>=60?'warn':'bad'}">${res.score}</b> · chạm để nghe mẫu</div>`:SH.mode!='rec'&&SH.view=='full'&&cur&&SH.mode=='listen'?`<div class="mut" style="font-size:.84rem">${esc(vi)}</div>`:''}</div>`}
function vShadow(L){const m=SH.mode,n=L.text.length;
 return `<h2 style="margin-top:6px">Shadowing cả bài</h2>
 <p class="mut" style="font-size:.88rem">${m=='rec'?'Đọc to câu đang tô sáng. Đọc xong chạm <b>Câu tiếp</b>.':'Nghe AI đọc mẫu trước, rồi bấm <b>Bắt đầu đọc</b>. App tô sáng từng câu, đọc hết bài AI sẽ chấm toàn bộ.'}</p>
 ${m=='idle'||m=='done'?`<div class="chips" style="margin:8px 0;flex-wrap:nowrap;overflow-x:auto">${SH_VIEW.map(([k,t])=>`<button class="chip ${SH.view==k?'on':''}" onclick="SH.view='${k}';render()">${t}</button>`).join('')}</div>
 <label class="mut" style="font-size:.84rem;display:block;margin-bottom:8px">Tốc độ giọng mẫu <select onchange="SH.rate=+this.value">${[[0.6,'Chậm'],[0.75,'Vừa'],[0.9,'Thường'],[1.05,'Nhanh']].map(([v,t])=>`<option value="${v}" ${SH.rate==v?'selected':''}>${t}</option>`).join('')}</select></label>`:''}
 ${m=='rec'?`<div class="lbl" style="color:var(--bad)">● Đang ghi âm · Câu ${SH.i+1}/${n}</div>`:''}
 <div class="card stack" style="gap:4px;padding:8px">${L.text.map((_,k)=>shSentHTML(L,k)).join('')}</div>
 ${m=='rec'?`<div style="position:sticky;bottom:calc(76px + env(safe-area-inset-bottom,0px));z-index:5;margin-top:10px" class="stack">
   <button class="btn" style="width:100%;min-height:56px;font-size:1.05rem" onclick="shNextSent()">${SH.i<n-1?'Câu tiếp ›':'✓ Đọc xong, AI chấm cả bài'}</button>
   <div class="row" style="flex-wrap:nowrap;gap:8px"><button class="btn ghost" style="flex:1" ${SH.i==0?'disabled':''} onclick="shPrevSent()">‹ Câu trước</button><button class="btn ghost" style="flex:1" onclick="shReplaySent()">🔊 Nghe câu này</button><button class="btn ghost" style="flex:1" onclick="shFinish()">■ Dừng & chấm</button></div></div>`
 :m=='grade'?`<p class="mut" style="text-align:center;margin-top:12px">AI đang nghe và chấm cả bài…</p>`
 :`<div class="stack" style="margin-top:12px"><button class="btn ghost" onclick="shListen()">${m=='listen'?'■ Dừng':'▶ Nghe AI đọc cả bài'}</button>
   ${m!='listen'?`<button class="btn" onclick="shStart()">🎤 ${SH.res?'Đọc lại cả bài':'Bắt đầu đọc'}</button>`:''}</div>
   <p class="mut" style="font-size:.82rem;margin-top:8px">Mẹo: đeo tai nghe, nói to, bắt chước chỗ nhấn và ngữ điệu. Nghe câu mẫu trong lúc đọc sẽ tạm dừng ghi âm.</p>`}
 ${SH.err?`<p class="note" style="margin-top:10px">${esc(SH.err)}</p>`:''}
 ${SH.res?`<div id="shres" style="margin-top:12px">${SH.res.partial?'<p class="mut" style="font-size:.84rem">Chấm phần bạn đã đọc.</p>':''}${vRes({...SH.res,words:[]})}${SH.url?`<button class="btn ghost" style="width:100%;margin-top:8px" onclick="new Audio(SH.url).play()">▶ Nghe lại bài mình đọc</button>`:''}</div>`:''}`}

/* ===================== NGƯỜI HỌC TỰ TẠO BÀI TỪ TRUYỆN NGẮN =====================
 Dán truyện 40–400 từ → AI (task 'story') soạn đủ 4 phần → kiểm tra, sửa lỗi → lưu trên máy (TLP.mine). */
TLP.mine=TLP.mine||[];
function tlAll(){let sh=[];try{sh=tlShared()}catch(e){}return [...TOPIC_LESSONS,...TLP.mine,...sh,...(TLC.preview&&TLC.preview.id==TLS.id?[TLC.preview]:[])]}
const tlArr=(x,n)=>Array.isArray(x)?x.slice(0,n):[];
function tlClean(r,src){const S2=s=>String(s??'').trim();
 const text=tlArr(r.text,14).map(x=>Array.isArray(x)?[S2(x[0]),S2(x[1])]:[S2(x.en||x),S2(x.vi)]).filter(x=>x[0].length>2);if(text.length<3)throw new Error('AI chưa tách được câu');
 const N=text.length,okI=i=>Number.isInteger(+i)&&+i>=0&&+i<N;
 const vocab=tlArr(r.vocab,12).map(v=>({en:S2(v.en),ipa:S2(v.ipa),pos:S2(v.pos),vi:S2(v.vi),ex:S2(v.ex),exvi:S2(v.exvi)})).filter(v=>v.en&&v.vi);if(vocab.length<4)throw new Error('AI chưa chọn đủ từ vựng');
 const ens=vocab.map(v=>v.en.toLowerCase());
 const fill=tlArr(r.fill,6).map(x=>[S2(x[0]),S2(x[1])]).filter(([q,a])=>q.includes('___')&&ens.includes(a.toLowerCase())).map(([q,a])=>[q,vocab[ens.indexOf(a.toLowerCase())].en]);
 const tf=tlArr(r.tf,5).map(x=>[S2(x[0]),x[1]===true||String(x[1]).toLowerCase()=='true']).filter(x=>x[0]);
 const mcq=tlArr(r.mcq,4).map(x=>[S2(x[0]),tlArr(x[1],4).map(S2),+x[2]]).filter(x=>x[0]&&x[1].length>=2&&x[2]>=0&&x[2]<x[1].length);
 const gaps=tlArr(r.gaps,8).map(x=>[+x[0],S2(x[1]).toLowerCase().replace(/[^a-z']/g,'')]).filter(([i,w])=>okI(i)&&w.length>1&&new RegExp('\\b'+w+'\\b').test(text[i][0]));
 const g=Array.isArray(r.gist)?r.gist:[];const gist=[S2(g[0])||'What is the main idea?',tlArr(g[1],4).map(S2),+g[2]||0];
 const idx=(a,n,def)=>{const v=[...new Set(tlArr(a,n).map(Number).filter(okI))];return v.length?v:def};
 const sounds=tlArr(r.sounds,5).map(x=>({ipa:S2(x.ipa),tip:S2(x.tip),words:tlArr(x.words,4).map(S2).filter(Boolean)})).filter(x=>x.ipa&&x.words.length);
 const linking=tlArr(r.linking,4).map(x=>[S2(x[0]),S2(x[1])]).filter(x=>x[0]);
 const stress=tlArr(r.stress,3).map(S2).filter(Boolean);
 const lv=['A1','A2','B1','B2','C1','C2'].includes(S2(r.level).toUpperCase())?S2(r.level).toUpperCase():'B1';
 return {id:'u'+Date.now(),mine:1,src,level:lv,title:S2(r.title)||'Truyện của tôi',vi:(S2(r.vi)||'Bài tự tạo')+' · AI soạn',text,vocab,fill,tf,mcq,
  discuss:S2(r.discuss)||'Retell the story in your own words.',gaps,gist:gist[1].length>=2?gist:['What is the main idea?',['—','—'],0],
  dictation:idx(r.dictation,2,[0]),sounds,linking,stress,shadow:idx(r.shadow,4,[0,1,2].filter(okI))}}
let TLN={busy:false,msg:''};
async function tlBuild(){const ta=document.getElementById('tlstory');const txt=(ta&&ta.value||'').replace(/\s+/g,' ').trim();const n=txt.split(' ').length;
 if(n<40)return TLN.msg='Truyện cần ít nhất 40 từ (hiện có '+n+').',render();if(n>400)return TLN.msg='Truyện tối đa khoảng 400 từ (hiện có '+n+'). Hãy cắt bớt.',render();
 if(/[À-ỹ]/.test(txt)&&txt.replace(/[^À-ỹ]/g,'').length>20)return TLN.msg='Hãy dán truyện bằng tiếng Anh.',render();
 TLN.busy=true;TLN.draft=txt;TLN.msg='AI đang soạn bài (khoảng 20–40 giây)…';render();
 try{const r=await ai('story',{text:txt});if(r&&r.error)throw new Error(r.error);const L=tlClean(r,txt.slice(0,60));TLP.mine.unshift(L);tlSave();if(typeof USER!='undefined'&&USER)tlSyncUp(L);TLN={busy:false,msg:''};toast('Đã tạo bài “'+L.title+'”');tlOpen(L.id)}
 catch(e){TLN.busy=false;TLN.msg=e&&e.code=='login'?'Hãy đăng nhập ở trang Tài khoản để dùng AI.':e&&e.code=='rate_limited'?'AI đang bận, thử lại sau ít phút.':'AI chưa soạn được bài: '+(e.message||e)+'. Bấm tạo lại.';render()}}
async function tlDel(id){const L=TLP.mine.find(x=>x.id==id);if(!L)return;
 if(!confirm(L.shared=='live'?'Bài này đang được chia sẻ cho cả khóa. Xóa sẽ gỡ bài khỏi khóa và khỏi tài khoản của bạn. Tiếp tục?':'Xóa bài này khỏi tài khoản và mọi thiết bị?'))return;
 if(L.sid&&typeof SB!='undefined'){const {error}=await SB.from('topic_lessons').delete().eq('id',L.sid);if(error)return toast('Chưa xóa được trên máy chủ: '+error.message)}
 TLP.mine=TLP.mine.filter(x=>x.id!=id);tlSave();TLC.for=null;go('home')}
function vStoryForm(){return `<button class="link" onclick="go('home')">‹ Trang Học</button><h1 style="margin-top:6px">Tạo bài từ truyện ngắn</h1>
 <p class="mut">Dán một truyện hoặc đoạn văn tiếng Anh 40–400 từ. AI soạn đủ 5 phần: Từ vựng, Đọc hiểu, Nghe, Phát âm, Shadowing.</p>
 <textarea id="tlstory" rows="10" style="width:100%" placeholder="Paste your English story here…" ${TLN.busy?'disabled':''}>${esc(TLN.draft||'')}</textarea>
 <div class="mut" style="font-size:.84rem;margin:6px 0">${esc(TLN.msg)}</div>
 <button class="btn" style="width:100%" ${TLN.busy?'disabled':''} onclick="tlBuild()">${TLN.busy?'Đang soạn…':'✨ AI tạo bài học'}</button>
 <p class="mut" style="font-size:.8rem;margin-top:8px">Bài lưu trên máy này. Câu hỏi và bản dịch do AI soạn, có thể chưa hoàn hảo.</p>`}

/* ===================== CHIA SẺ BÀI TRUYỆN CHO KHÓA (admin duyệt) =====================
 Bảng supabase/topic_lessons.sql. Bài đã duyệt hiện cho mọi người trong khóa, cạnh các bài có sẵn. */
let TLC={for:null,list:[],pend:null,pfor:null,err:''};
const tlStrip=L=>{const o={...L};['mine','shared','sid','id','author','status','own','trk'].forEach(k=>delete o[k]);return o};
async function tlcLoad(){const tr=typeof curTrack=='function'&&curTrack();TLC.for=tr?.id||'x';TLC.list=[];if(!tr||typeof SB=='undefined'||!USER)return;
 const {data,error}=await SB.from('topic_lessons').select('id,title,level,data,author,status,created_by').eq('track_id',tr.id).order('id',{ascending:false}).limit(60);
 if(error){TLC.err=/topic_lessons/.test(error.message)?'need_sql':error.message;return}
 TLC.list=(data||[]).map(r=>({...r.data,id:'s'+r.id,sid:r.id,status:r.status,author:r.author,own:r.created_by==USER.id,title:r.title||r.data.title}));
 /* đồng bộ bài của mình: kéo bài từ máy chủ về, cập nhật trạng thái, đẩy bài chưa lưu lên */
 let ch=0;for(const r of TLC.list.filter(x=>x.own)){const L=TLP.mine.find(x=>x.sid==r.sid);if(L){if(L.shared!=r.status){L.shared=r.status;ch=1}}else{TLP.mine.push({...r,id:'u'+r.sid,mine:1,trk:tr.id,shared:r.status,own:undefined,status:undefined});ch=1}}
 for(const L of TLP.mine)if(L.sid&&L.trk==tr.id&&!TLC.list.some(x=>x.sid==L.sid)){L.sid=null;L.shared=undefined;ch=1}
 if(ch)tlSave();for(const L of TLP.mine.filter(x=>!x.sid))await tlSyncUp(L,1);render()}
async function tlSyncUp(L,quiet){const tr=typeof curTrack=='function'&&curTrack();if(!tr||!USER||L.sid)return;
 const {data,error}=await SB.from('topic_lessons').insert({track_id:tr.id,title:L.title.slice(0,120),level:L.level,data:tlStrip(L),status:'private',author:PROF?.full_name||USER.email.split('@')[0]}).select('id').single();
 if(error){if(!quiet)toast(/topic_lessons|check constraint|policy/.test(error.message)?'Admin cần chạy lại supabase/topic_lessons.sql':'Chưa lưu được lên tài khoản: '+error.message);return}
 L.sid=data.id;L.trk=tr.id;L.shared='private';tlSave()}
function tlShared(){const tid=(typeof curTrack=='function'&&curTrack()?.id)||'x';if(TLC.for!==tid)tlcLoad();const mine=new Set(TLP.mine.map(x=>x.sid).filter(Boolean));return TLC.list.filter(x=>x.status=='live'&&!x.own&&!mine.has(x.sid))}
async function tlShare(id){const L=TLP.mine.find(x=>x.id==id);const tr=curTrack();if(!L||!tr)return;if(!USER)return toast('Hãy đăng nhập để chia sẻ');
 if(!confirm('Chia sẻ bài “'+L.title+'” cho mọi người trong khóa '+tr.name+'? '+(PROF?.is_admin?'Bạn là admin nên bài sẽ hiện ngay cho cả khóa.':'Admin sẽ xem và duyệt trước khi hiện.')))return;
 if(!L.sid){await tlSyncUp(L);if(!L.sid)return}
 const now=new Date().toISOString();
 if(PROF?.is_admin){const {error}=await SB.from('topic_lessons').update({status:'live',note:'admin tự đăng',reviewed_at:now,data:tlStrip(L),title:L.title.slice(0,120)}).eq('id',L.sid);if(error)return toast('Lỗi: '+error.message);L.shared='live';TLC.for=null;tlSave();toast('Đã đăng cho cả khóa');return render()}
 const {error}=await SB.from('topic_lessons').update({status:'pending',note:'',data:tlStrip(L),title:L.title.slice(0,120)}).eq('id',L.sid);
 if(error)return toast(/policy|constraint/.test(error.message)?'Admin cần chạy lại supabase/topic_lessons.sql':'Lỗi: '+error.message);
 L.shared='pending';tlSave();toast('Đã gửi, chờ admin duyệt');render()}
/* Admin gỡ bài đang chia sẻ khỏi khóa (bài vẫn còn trong tài khoản tác giả) */
async function tlUnpub(sid){if(!confirm('Gỡ bài này khỏi khóa? Mọi người sẽ không thấy bài nữa; tác giả vẫn giữ bài trong tài khoản.'))return;
 const {error}=await SB.from('topic_lessons').update({status:'rejected',note:'Admin đã gỡ khỏi khóa',reviewed_at:new Date().toISOString()}).eq('id',sid);if(error)return toast(error.message);
 const M=TLP.mine.find(x=>x.sid==sid);if(M){M.shared='rejected';tlSave()}TLC.for=null;toast('Đã gỡ bài khỏi khóa');go('home')}
/* Admin */
async function tlaLoad(){const tr=curTrack();TLC.pfor=tr?.id;const {data,error}=await SB.from('topic_lessons').select('*').eq('track_id',tr.id).eq('status','pending').order('id');TLC.pend=error?[]:(data||[]);TLC.perr=error&&/topic_lessons/.test(error.message);render()}
async function tlaSet(id,st){let note='';if(st=='rejected'){note=prompt('Lý do từ chối (không bắt buộc):')||'';}
 const {error}=await SB.from('topic_lessons').update({status:st,note,reviewed_at:new Date().toISOString()}).eq('id',id);if(error)return toast(error.message);
 TLC.pend=TLC.pend.filter(x=>x.id!==id);TLC.for=null;toast(st=='live'?'Đã duyệt':'Đã từ chối');render()}
function tlaPreview(id){const r=TLC.pend.find(x=>x.id==id);if(!r)return;TLS={id:'p'+id,part:'read',a:{}};TLC.preview={...r.data,id:'p'+id,title:r.title,vi:'Xem trước · chờ duyệt'};go('tl')}
function vTopicAdmin(){const tr=curTrack();if(!tr)return '';if(TLC.pfor!==tr.id){TLC.pend=null;tlaLoad()}const L=TLC.pend||[];
 if(TLC.perr)return `<h2>Bài truyện chờ duyệt</h2><p class="note">Chạy <b>supabase/topic_lessons.sql</b> trong Supabase → SQL Editor để bật chia sẻ bài truyện.</p>`;
 return `<h2>Bài truyện chờ duyệt · ${esc(shortName(tr))}</h2>${!L.length?'<p class="mut">Không có bài nào chờ duyệt.</p>':`<div class="stack">${L.map(r=>{const d=r.data||{};return `<div class="card stack" style="gap:6px"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><b>${esc(r.title)}</b><span class="chip">${esc(r.level||'')}</span></div><small class="mut">${esc(r.author||'')} · ${(d.text||[]).length} câu · ${(d.vocab||[]).length} từ · ${(d.tf||[]).length+(d.mcq||[]).length} câu hỏi</small>
 <details><summary class="link">Xem truyện & từ vựng</summary><div style="margin-top:6px">${(d.text||[]).map(x=>`<p style="margin:4px 0">${esc(x[0])}<br><small class="mut">${esc(x[1])}</small></p>`).join('')}<div class="stack" style="gap:2px;margin-top:6px">${(d.vocab||[]).map(v=>`<small><b>${esc(v.en)}</b> ${esc(v.ipa||'')} · ${esc(v.vi)}</small>`).join('')}</div></div></details>
 <div class="row"><button class="chip" onclick="tlaPreview(${r.id})">👁 Mở thử bài</button><button class="chip" onclick="tlaSet(${r.id},'live')">✓ Duyệt</button><button class="chip danger" onclick="tlaSet(${r.id},'rejected')">Từ chối</button></div></div>`}).join('')}</div>`}`}
