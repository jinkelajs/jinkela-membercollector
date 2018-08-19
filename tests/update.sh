for i in 1.*
do
  cd $i
  rm *.html
  ln -s ../*.html .
  cd ..
done
